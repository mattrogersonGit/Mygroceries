// Reads a receipt photo or PDF that the client already uploaded to the
// `receipts` Storage bucket, asks OpenAI to extract store/date/total/items,
// and returns that as a *draft* - the client always shows a review/edit
// screen before anything is written to receipt_items. Never write straight
// from here into receipt_items: OCR misreads (blurry photos, multi-buy
// lines, truncated names) are expected, not exceptional.
//
// PDF support confirmed against OpenAI's live docs (developers.openai.com/
// api/docs/guides/pdf-files) on 2026-07-16: Chat Completions accepts a
// `{type: "file", file: {filename, file_data: "data:application/pdf;base64,..."}}`
// content block, requires a vision-capable model (gpt-4o and later, which
// covers gpt-4o-mini), and caps each file at 50MB.
import OpenAI from "npm:openai";
import { createClient } from "npm:@supabase/supabase-js@2";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { corsHeaders } from "../_shared/cors.ts";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function markFailed(
  supabase: ReturnType<typeof createClient>,
  receiptId: string,
  reason?: string,
) {
  await supabase
    .from("receipts")
    .update({ status: "failed", raw_ai_response: reason ? { error: reason } : null })
    .eq("id", receiptId);
}

type FileKind = { kind: "image"; mediaType: string } | { kind: "pdf" };

function fileKindForExt(ext: string): FileKind | null {
  if (ext === "pdf") return { kind: "pdf" };
  if (ext === "png") return { kind: "image", mediaType: "image/png" };
  if (ext === "webp") return { kind: "image", mediaType: "image/webp" };
  if (ext === "gif") return { kind: "image", mediaType: "image/gif" };
  if (ext === "jpg" || ext === "jpeg") return { kind: "image", mediaType: "image/jpeg" };
  return null; // unrecognised extension
}

// OpenAI's structured-outputs "strict" mode requires every property to be
// listed in `required`; a field is made optional/nullable by including
// "null" in its own `type` array instead of omitting it from `required`.
const RECEIPT_SCHEMA = {
  type: "object",
  properties: {
    store_label: {
      type: ["string", "null"],
      description: "Store/retailer name as printed on the receipt",
    },
    receipt_date: {
      type: ["string", "null"],
      description: "Receipt date in ISO 8601 (YYYY-MM-DD)",
    },
    total: {
      type: ["number", "null"],
      description: "Total amount paid, in dollars",
    },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          label: { type: "string" },
          price: { type: "number", description: "Price in dollars, not cents" },
        },
        required: ["label", "price"],
        additionalProperties: false,
      },
    },
  },
  required: ["store_label", "receipt_date", "total", "items"],
  additionalProperties: false,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let supabase: ReturnType<typeof createClient> | null = null;
  let receiptId: string | undefined;

  try {
    const body = await req.json();
    receiptId = body.receipt_id;
    if (!receiptId) return jsonResponse({ error: "receipt_id is required" }, 400);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse({ error: "Missing Authorization header" }, 401);

    // Uses the caller's own JWT (not the service role key) so every query and
    // storage read below is still subject to the household RLS policies -
    // this function can only ever touch the caller's own household's receipt.
    supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: receipt, error: receiptErr } = await supabase
      .from("receipts")
      .select("id, image_path")
      .eq("id", receiptId)
      .single();
    if (receiptErr || !receipt) {
      return jsonResponse({ error: "Receipt not found" }, 404);
    }

    const ext = (receipt.image_path as string).split(".").pop()?.toLowerCase() ?? "";
    const fileKind = fileKindForExt(ext);
    if (!fileKind) {
      await markFailed(supabase, receiptId, `Unsupported file type: .${ext}`);
      return jsonResponse({ error: `Unsupported file type: .${ext} - upload a photo or PDF` }, 400);
    }

    const { data: fileBlob, error: downloadErr } = await supabase.storage
      .from("receipts")
      .download(receipt.image_path as string);
    if (downloadErr || !fileBlob) {
      await markFailed(supabase, receiptId, `Could not download receipt file: ${downloadErr?.message}`);
      return jsonResponse({ error: `Could not download receipt file: ${downloadErr?.message}` }, 500);
    }

    const bytes = new Uint8Array(await fileBlob.arrayBuffer());
    const base64 = encodeBase64(bytes);

    const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });

    const fileContentBlock = fileKind.kind === "pdf"
      ? {
          type: "file" as const,
          file: { filename: `receipt.pdf`, file_data: `data:application/pdf;base64,${base64}` },
        }
      : { type: "image_url" as const, image_url: { url: `data:${fileKind.mediaType};base64,${base64}` } };

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                "This is a photo or PDF of a grocery store receipt. Extract the store name, the receipt date, the " +
                "total amount paid, and every purchased line item with its price in dollars (not cents). Skip " +
                "subtotal, tax, tender, change, and loyalty-points lines - only include actual purchased items. " +
                "If a field isn't legible or present, use null rather than guessing.",
            },
            fileContentBlock,
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "receipt_extraction", strict: true, schema: RECEIPT_SCHEMA },
      },
    });

    const choice = completion.choices[0];

    if (choice?.finish_reason === "length") {
      await markFailed(supabase, receiptId, "Response was truncated - too many items on the receipt");
      return jsonResponse({ error: "Response was truncated (receipt may have too many items)" }, 500);
    }
    if (choice?.message?.refusal) {
      await markFailed(supabase, receiptId, choice.message.refusal);
      return jsonResponse({ error: "OpenAI declined to analyze this receipt" }, 422);
    }

    const content = choice?.message?.content;
    if (!content) {
      await markFailed(supabase, receiptId, "No content in OpenAI's response");
      return jsonResponse({ error: "No content in OpenAI's response" }, 500);
    }

    const draft = JSON.parse(content);

    // Persist the draft + raw response now so status moves off "pending" even
    // if the user never finishes reviewing - "Recent receipts" can still show
    // something sensible. The user's edits on the review screen are what
    // actually get saved to receipt_items on confirm, not this draft.
    await supabase
      .from("receipts")
      .update({
        store_label: draft.store_label ?? null,
        chain: draft.store_label ?? null,
        receipt_date: draft.receipt_date ?? null,
        total: draft.total ?? null,
        raw_ai_response: completion,
      })
      .eq("id", receiptId);

    return jsonResponse({ draft });
  } catch (err) {
    console.error(err);
    if (supabase && receiptId) {
      await markFailed(supabase, receiptId, err instanceof Error ? err.message : "Unknown error");
    }
    return jsonResponse({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});
