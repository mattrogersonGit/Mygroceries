// Reads a receipt photo/PDF that the client already uploaded to the
// `receipts` Storage bucket, asks Claude to extract store/date/total/items,
// and returns that as a *draft* - the client always shows a review/edit
// screen before anything is written to receipt_items. Never write straight
// from here into receipt_items: OCR misreads (blurry photos, multi-buy
// lines, truncated names) are expected, not exceptional.
import Anthropic from "npm:@anthropic-ai/sdk";
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

function mediaTypeForExt(ext: string): { isPdf: boolean; mediaType: string } {
  if (ext === "pdf") return { isPdf: true, mediaType: "application/pdf" };
  if (ext === "png") return { isPdf: false, mediaType: "image/png" };
  if (ext === "webp") return { isPdf: false, mediaType: "image/webp" };
  if (ext === "gif") return { isPdf: false, mediaType: "image/gif" };
  return { isPdf: false, mediaType: "image/jpeg" }; // jpg/jpeg and any other fallback
}

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

    const { data: fileBlob, error: downloadErr } = await supabase.storage
      .from("receipts")
      .download(receipt.image_path as string);
    if (downloadErr || !fileBlob) {
      await markFailed(supabase, receiptId, `Could not download receipt file: ${downloadErr?.message}`);
      return jsonResponse({ error: `Could not download receipt file: ${downloadErr?.message}` }, 500);
    }

    const bytes = new Uint8Array(await fileBlob.arrayBuffer());
    const base64 = encodeBase64(bytes);
    const ext = (receipt.image_path as string).split(".").pop()?.toLowerCase() ?? "";
    const { isPdf, mediaType } = mediaTypeForExt(ext);

    const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") });

    const contentBlock = isPdf
      ? {
          type: "document" as const,
          source: { type: "base64" as const, media_type: "application/pdf" as const, data: base64 },
        }
      : {
          type: "image" as const,
          // deno-lint-ignore no-explicit-any
          source: { type: "base64" as const, media_type: mediaType as any, data: base64 },
        };

    const response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              store_label: {
                anyOf: [{ type: "string" }, { type: "null" }],
                description: "Store/retailer name as printed on the receipt",
              },
              receipt_date: {
                anyOf: [{ type: "string" }, { type: "null" }],
                description: "Receipt date in ISO 8601 (YYYY-MM-DD)",
              },
              total: {
                anyOf: [{ type: "number" }, { type: "null" }],
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
            required: ["items"],
            additionalProperties: false,
          },
        },
      },
      messages: [
        {
          role: "user",
          content: [
            contentBlock,
            {
              type: "text",
              text:
                "This is a photo or PDF of a grocery store receipt. Extract the store name, the receipt date, " +
                "the total amount paid, and every purchased line item with its price in dollars (not cents). " +
                "Skip subtotal, tax, tender, change, and loyalty-points lines - only include actual purchased " +
                "items. If a field isn't legible or present, use null rather than guessing.",
            },
          ],
        },
      ],
    });

    if (response.stop_reason === "refusal") {
      await markFailed(supabase, receiptId, "Claude declined to analyze this receipt");
      return jsonResponse({ error: "Claude declined to analyze this receipt" }, 422);
    }
    if (response.stop_reason === "max_tokens") {
      await markFailed(supabase, receiptId, "Response was truncated - too many items on the receipt");
      return jsonResponse({ error: "Response was truncated (receipt may have too many items)" }, 500);
    }

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      await markFailed(supabase, receiptId, "No text content in Claude's response");
      return jsonResponse({ error: "No text content in Claude's response" }, 500);
    }

    const draft = JSON.parse(textBlock.text);

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
        raw_ai_response: response,
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
