// Pak'nSave and New World: fetched live from api-prod.paknsave.co.nz/v1/edge/store and
// api-prod.newworld.co.nz/v1/edge/store (Foodstuffs' own real store API, discovered while
// building the price scraper) - real store UUIDs, real addresses/coordinates directly from
// the retailer. These IDs are what the scraper passes as storeId when searching prices, so
// they must stay in sync with whatever household_stores.store_id values the app saves.
// Woolworths: compiled via OpenStreetMap/Overpass (see tools/compile-stores.md) since
// woolworths.co.nz was unreachable for direct fetching - see that doc for known gaps.
const STORES = [
  {
    "chain": "paknsave",
    "id": "3bb30799-82ce-4648-8c02-5113228963ed",
    "name": "PAK'nSAVE Te Awamutu",
    "address": "670 Cambridge Road, Te Awamutu, 3800, New Zealand",
    "lat": -38.008101,
    "lng": 175.340102
  },
  {
    "chain": "paknsave",
    "id": "50b1216b-d066-4457-b88b-9bccf97bf6d3",
    "name": "PAK'nSAVE Whakatane",
    "address": "45 King Street, Whakatane, 3120, New Zealand",
    "lat": -37.961198,
    "lng": 176.98257
  },
  {
    "chain": "paknsave",
    "id": "9cd8eb60-3222-4efc-bd7c-50e03e6a81a4",
    "name": "PAK'nSAVE Manukau",
    "address": "6 Cavendish Drive, Manukau City, Auckland, 2104, New Zealand",
    "lat": -36.987929,
    "lng": 174.880604
  },
  {
    "chain": "paknsave",
    "id": "b92cc33f-b5a8-4b57-9b82-412946800020",
    "name": "PAK'nSAVE Taupo",
    "address": "105-131 Ruapehu Street, Taupo, 3330, New Zealand",
    "lat": -38.685532,
    "lng": 176.073247
  },
  {
    "chain": "paknsave",
    "id": "3c5e3145-0767-4066-9349-6c0a1313acc5",
    "name": "PAK'nSAVE Kaitaia",
    "address": "111 North Road, Kaitaia, 0410, New Zealand",
    "lat": -35.09945,
    "lng": 173.258322
  },
  {
    "chain": "paknsave",
    "id": "b39562a4-2b72-43fe-b9ba-eda1d651ad0b",
    "name": "PAK'nSAVE Hastings",
    "address": "602 Heretaunga Street West, West End Shopping Centre, Hastings, 4120, New Zealand",
    "lat": -39.636804,
    "lng": 176.836635
  },
  {
    "chain": "paknsave",
    "id": "714431ab-6e39-4df6-ac77-cfc5c1e25bc8",
    "name": "PAK'nSAVE Cameron Road",
    "address": "476 Cameron Road, Tauranga, 3110, New Zealand",
    "lat": -37.696716,
    "lng": 176.161533
  },
  {
    "chain": "paknsave",
    "id": "3bfe040b-f0c9-45e0-949b-b9ad5a591d55",
    "name": "PAK'nSAVE Papamoa",
    "address": "42 Domain Road, Papamoa Beach, Papamoa, 3118, New Zealand",
    "lat": -37.70191,
    "lng": 176.283687
  },
  {
    "chain": "paknsave",
    "id": "529d66cc-60e3-432e-b8d1-efc9f2ec4919",
    "name": "PAK'nSAVE Whangarei",
    "address": "104 Walton Street, Whangarei, 0110, New Zealand",
    "lat": -35.725958,
    "lng": 174.32475
  },
  {
    "chain": "paknsave",
    "id": "5f167936-79ae-4f6a-b9d2-74afe1bb096b",
    "name": "PAK'nSAVE Ormiston",
    "address": "1 Bellingham Road, Flat Bush, Auckland, 2019, New Zealand",
    "lat": -36.965078,
    "lng": 174.914819
  },
  {
    "chain": "paknsave",
    "id": "6e6809dd-01bc-45c9-aab1-f01ccd8338b0",
    "name": "PAK'nSAVE Thames",
    "address": "100 Mary Street, Thames, 3500, New Zealand",
    "lat": -37.138597,
    "lng": 175.538994
  },
  {
    "chain": "paknsave",
    "id": "6c73764e-b8e6-4e55-ad37-f6a9d207da1f",
    "name": "PAK'nSAVE Alderman Dr Hen",
    "address": "8-18 Alderman Drive, Henderson, Auckland, 0612, New Zealand",
    "lat": -36.87743,
    "lng": 174.63292
  },
  {
    "chain": "paknsave",
    "id": "e1925ea7-01bc-4358-ae7c-c6502da5ab12",
    "name": "PAK'nSAVE Royal Oak",
    "address": "691 Manukau Road, Royal Oak, Auckland, 1023, New Zealand",
    "lat": -36.91014,
    "lng": 174.77342
  },
  {
    "chain": "paknsave",
    "id": "60561e46-ece7-43a7-b142-9b14812586e4",
    "name": "PAK'nSAVE Botany",
    "address": "501 Ti Rakau Drive, Northpark, Auckland, 2013, New Zealand",
    "lat": -36.930652,
    "lng": 174.913004
  },
  {
    "chain": "paknsave",
    "id": "21ecaaed-0749-4492-985e-4bb7ba43d59c",
    "name": "PAK'nSAVE Kilbirnie",
    "address": "76 Rongotai Road, Kilbirnie, Wellington, 6003, New Zealand",
    "lat": -41.319324,
    "lng": 174.79672
  },
  {
    "chain": "paknsave",
    "id": "64eab5b1-8d79-45f4-94f1-02b8cf8b6202",
    "name": "PAK'nSAVE Silverdale",
    "address": "20 Hibiscus Coast Highway, Silverdale, Auckland, 0932, New Zealand",
    "lat": -36.620413,
    "lng": 174.672975
  },
  {
    "chain": "paknsave",
    "id": "c2204dae-579e-4b6b-9d42-2e13ceaa6031",
    "name": "PAK'nSAVE Pukekohe",
    "address": "99 Queen Street, Pukekohe, 2120, New Zealand",
    "lat": -37.205157,
    "lng": 174.899612
  },
  {
    "chain": "paknsave",
    "id": "7d48a781-4f68-4c91-a908-8659e1b22f95",
    "name": "PAK'nSAVE Rotorua",
    "address": "Cnr Fenton and Amohau Streets, Rotorua, 3010, New Zealand",
    "lat": -38.140495,
    "lng": 176.25459
  },
  {
    "chain": "paknsave",
    "id": "b2e98a14-c8ca-401e-99ed-edf74570c6f6",
    "name": "PAK'nSAVE Mt Albert",
    "address": "1167-1177 New North Road, Auckland, 1025, New Zealand",
    "lat": -36.89305,
    "lng": 174.70624
  },
  {
    "chain": "paknsave",
    "id": "3e82142c-78dc-46f3-82ec-28e65fcf84c9",
    "name": "PAK'nSAVE Clendon",
    "address": "16 Robert Ross Place, Clendon Park, Auckland, 2103, New Zealand",
    "lat": -37.03242,
    "lng": 174.867278
  },
  {
    "chain": "paknsave",
    "id": "a7d09522-bee2-41e4-8fe0-0b82b7f342f5",
    "name": "PAK'nSAVE Papakura",
    "address": "331-345 Great South Road, Takanini, Auckland, 2110, New Zealand",
    "lat": -37.053393,
    "lng": 174.93096
  },
  {
    "chain": "paknsave",
    "id": "3404c253-577f-45ca-b301-c98312e46efb",
    "name": "PAK'nSAVE Glen Innes",
    "address": "182 Apirana Avenue, Glen Innes, Auckland, 1072, New Zealand",
    "lat": -36.875918,
    "lng": 174.855148
  },
  {
    "chain": "paknsave",
    "id": "076e8177-943b-41fc-a885-ba3d28297acf",
    "name": "PAK'nSAVE Mill Street",
    "address": "17 Mill Street, Whitiora, Hamilton, 3200, New Zealand",
    "lat": -37.7799,
    "lng": 175.27281
  },
  {
    "chain": "paknsave",
    "id": "65defcf2-bc15-490e-a84f-1f13b769cd22",
    "name": "PAK'nSAVE Albany",
    "address": "Don McKinnon Drive, Albany, Auckland, 0632, New Zealand",
    "lat": -36.729975,
    "lng": 174.706725
  },
  {
    "chain": "paknsave",
    "id": "d6d39eea-889d-4e20-923c-55cab225cf7f",
    "name": "PAK'nSAVE Clarence St",
    "address": "85 Clarence Street, Hamilton Lake, Hamilton, 3204, New Zealand",
    "lat": -37.795653,
    "lng": 175.282839
  },
  {
    "chain": "paknsave",
    "id": "33d8d6fc-861a-45ff-9937-5ccdb55eaede",
    "name": "PAK'nSAVE Westgate",
    "address": "17-19 Fred Taylor Drive, Massey, Auckland, 0814, New Zealand",
    "lat": -36.820257,
    "lng": 174.608696
  },
  {
    "chain": "paknsave",
    "id": "92086ded-a55d-4241-a364-7d7ea91531b4",
    "name": "PAK'nSAVE Lincoln Road",
    "address": "202 Lincoln Road, Henderson, Auckland, 0610, New Zealand",
    "lat": -36.857794,
    "lng": 174.627968
  },
  {
    "chain": "paknsave",
    "id": "c0f80e87-16be-4488-9553-da437e8c6c2a",
    "name": "PAK'nSAVE Sylvia Park",
    "address": "286 Mt Wellington Highway, Mt Wellington, Auckland, 1060, New Zealand",
    "lat": -36.913347,
    "lng": 174.84009
  },
  {
    "chain": "paknsave",
    "id": "94ef1985-cab1-4b39-a2f3-230120f03c16",
    "name": "PAK'nSAVE Mangere",
    "address": "44 Orly Avenue, Mangere, Auckland, 2022, New Zealand",
    "lat": -36.968516,
    "lng": 174.796863
  },
  {
    "chain": "paknsave",
    "id": "15e6f441-5c1c-4d25-b4ec-1adf918c49c7",
    "name": "PAK'nSAVE Hawera",
    "address": "54 Princes Street, Hawera, 4610, New Zealand",
    "lat": -39.590947,
    "lng": 174.283801
  },
  {
    "chain": "paknsave",
    "id": "c180a72d-5dbe-4403-b7c7-91655e505492",
    "name": "PAK'nSAVE Kapiti",
    "address": "76 Rimu Road, Paraparaumu, 5032, New Zealand",
    "lat": -40.9180863,
    "lng": 175.0017611
  },
  {
    "chain": "paknsave",
    "id": "b83029b6-5dd5-449e-8056-26f3943a4e18",
    "name": "PAK'nSAVE Lower Hutt",
    "address": "20 Brunswick Street, Hutt Central, Lower Hutt, 5010, New Zealand",
    "lat": -41.205578,
    "lng": 174.913149
  },
  {
    "chain": "paknsave",
    "id": "49037947-e450-49bf-ba1f-a94551c79a72",
    "name": "PAK'nSAVE Napier City",
    "address": "25 Munroe Street, Napier South, Napier South NAPIER, 4110, New Zealand",
    "lat": -39.494788,
    "lng": 176.913562
  },
  {
    "chain": "paknsave",
    "id": "48dd98cc-a757-4102-b15d-ea82b4b10571",
    "name": "PAK'nSAVE Palmerston N",
    "address": "327 Ferguson Street, Palmerston North, 4410, New Zealand",
    "lat": -40.359198,
    "lng": 175.611537
  },
  {
    "chain": "paknsave",
    "id": "98ec3885-ac93-4fcb-807b-59c9055c52c4",
    "name": "PAK'nSAVE Petone",
    "address": "114-124 Jackson Street, Petone, Wellington, 5012, New Zealand",
    "lat": -41.224456,
    "lng": 174.872537
  },
  {
    "chain": "paknsave",
    "id": "af385423-d0f1-41f0-9482-ffd10b745143",
    "name": "PAK'nSAVE Porirua",
    "address": "12 Parumoana Street, Porirua City Centre, Porirua, 5022, New Zealand",
    "lat": -41.131559,
    "lng": 174.841818
  },
  {
    "chain": "paknsave",
    "id": "6cda96e1-7d29-44a6-956b-3fcfdecc8184",
    "name": "PAK'nSAVE Tamatea",
    "address": "Leicester Avenue, Tamatea, Napier, 4112, New Zealand",
    "lat": -39.509905,
    "lng": 176.869414
  },
  {
    "chain": "paknsave",
    "id": "4fcc1c8e-cc5e-4675-ba25-5e56b579cf69",
    "name": "PAK'nSAVE Upper Hutt",
    "address": "Gibbons Street, Upper Hutt, 5018, New Zealand",
    "lat": -41.123787,
    "lng": 175.066601
  },
  {
    "chain": "paknsave",
    "id": "01a114de-149c-4f5f-80a1-90cc63f69c6e",
    "name": "PAK'nSAVE Whanganui",
    "address": "167 Glasgow Street, Whanganui, 4500, New Zealand",
    "lat": -39.92638,
    "lng": 175.038901
  },
  {
    "chain": "paknsave",
    "id": "90082979-fb9f-4305-9c72-83274fc438cc",
    "name": "PAK'nSAVE Dunedin",
    "address": "86 Hillside Road, South Dunedin, Dunedin, 9012, New Zealand",
    "lat": -45.8927,
    "lng": 170.4992
  },
  {
    "chain": "paknsave",
    "id": "1c388d5e-29ac-4956-b476-cb3431353d2e",
    "name": "PAK'nSAVE Tauriko",
    "address": "2 Taurikura Drive, Tauriko, Tauranga, 3110, New Zealand",
    "lat": -37.738653,
    "lng": 176.103745
  },
  {
    "chain": "paknsave",
    "id": "d1cd1fdd-8767-46a6-a8d3-c3e0632c2dc8",
    "name": "PAK'nSAVE Masterton",
    "address": "424 Queen Street, Kuripuni, Masterton, 5810, New Zealand",
    "lat": -40.957214,
    "lng": 175.649687
  },
  {
    "chain": "paknsave",
    "id": "53989945-1a28-481d-a61c-d6f75f760ada",
    "name": "PAK'nSAVE New Plymouth",
    "address": "53 Leach Street, New Plymouth, 4310, New Zealand",
    "lat": -39.05712,
    "lng": 174.08127
  },
  {
    "chain": "paknsave",
    "id": "8cd700ae-d96f-4761-bd7a-805d6b93536d",
    "name": "PAK'nSAVE Papanui",
    "address": "171 Main North Road, Redwood, Christchurch, 8051, New Zealand",
    "lat": -43.48557,
    "lng": 172.61472
  },
  {
    "chain": "paknsave",
    "id": "5cf0392f-c187-4fc4-a463-eb269d2e8f45",
    "name": "PAK'nSAVE Richmond",
    "address": "Croucher and Talbot Streeet, Richmond, Nelson, 7020, New Zealand",
    "lat": -41.3386,
    "lng": 173.1866
  },
  {
    "chain": "paknsave",
    "id": "61dd754e-8525-4b9e-9e08-173389eea8a8",
    "name": "PAK'nSAVE Moorhouse",
    "address": "297 Moorhouse Avenue, Sydenham, Christchurch, 8011, New Zealand",
    "lat": -43.5392,
    "lng": 172.6383
  },
  {
    "chain": "paknsave",
    "id": "715f0e22-95e0-45ce-af3a-07057209976e",
    "name": "PAK'nSAVE Rangiora",
    "address": "2 Southbrook Road, Waimakariri, Rangiora, 7400, New Zealand",
    "lat": -43.3248,
    "lng": 172.5999
  },
  {
    "chain": "paknsave",
    "id": "dbca5e00-f7f9-43ae-91de-031ad16f8a92",
    "name": "PAK'nSAVE Wainoni",
    "address": "174 Wainoni Road, Avondale, Christchurch, 8061, New Zealand",
    "lat": -43.5125,
    "lng": 172.6933
  },
  {
    "chain": "paknsave",
    "id": "d8032da3-c1b9-456e-b626-41ce21f8c67b",
    "name": "PAK'nSAVE Invercargill",
    "address": "95 Tay Street, Invercargill, Invercargill, 9810, New Zealand",
    "lat": -46.4143,
    "lng": 168.353
  },
  {
    "chain": "paknsave",
    "id": "b29a98bd-749c-489c-9eef-6aa38e66a29b",
    "name": "PAK'nSAVE Timaru",
    "address": "Evans Street, Waimataitai, Timaru, 7910, New Zealand",
    "lat": -44.383,
    "lng": 171.2366
  },
  {
    "chain": "paknsave",
    "id": "2ed73be8-936d-4f35-9398-75a707f40a7b",
    "name": "PAK'nSAVE Queenstown",
    "address": "302 Hawthorne Drive, Frankton, Queenstown, 9300, New Zealand",
    "lat": -45.0108,
    "lng": 168.7492
  },
  {
    "chain": "paknsave",
    "id": "c3f9e1a3-fc34-452d-af2e-95349e666ba4",
    "name": "PAK'nSAVE Blenheim",
    "address": "1 Westwood Avenue, Springlands, Blenheim, 7271, New Zealand",
    "lat": -41.5087,
    "lng": 173.9234
  },
  {
    "chain": "paknsave",
    "id": "be4c4780-218e-425a-a90f-63e21773572b",
    "name": "PAK'nSAVE Hornby",
    "address": "418 Main South Road, Hornby, Christchurch, 8042, New Zealand",
    "lat": -43.543,
    "lng": 172.5232
  },
  {
    "chain": "paknsave",
    "id": "4a279605-eaa8-470d-bcd4-0a9e3c9ab43b",
    "name": "PAK'nSAVE Riccarton",
    "address": "129 Riccarton Road, Riccarton, Christchurch, 8041, New Zealand",
    "lat": -43.5312,
    "lng": 172.5963
  },
  {
    "chain": "paknsave",
    "id": "8f0d70be-5cb7-464b-99cb-8b0130671895",
    "name": "PAK'nSAVE Warkworth",
    "address": "12 Hudson Road, Warkworth, 0910, New Zealand",
    "lat": -36.392108,
    "lng": 174.649519
  },
  {
    "chain": "paknsave",
    "id": "2a1b331a-fc4a-496a-b072-e97cc8f70cae",
    "name": "PAK'nSAVE Highland Park",
    "address": "503 - 505 Pakuranga Road, Highland Park, 2010, New Zealand",
    "lat": -36.8988953,
    "lng": 174.9047405
  },
  {
    "chain": "paknsave",
    "id": "bdc5ef4a-c6a7-4f8a-b8cb-28109e6d61c3",
    "name": "PAK'nSAVE Rolleston",
    "address": "157 Levi Road, Rolleston, Rolleston, 7614, New Zealand",
    "lat": -43.59731231,
    "lng": 172.39645748
  },
  {
    "chain": "newworld",
    "id": "3e66e1a7-bf5c-4f39-9638-c3f57e5c3889",
    "name": "New World Gate Pa",
    "address": "948 Cameron Road, Gate Pa, Tauranga, 3112, New Zealand",
    "lat": -37.713787,
    "lng": 176.142697
  },
  {
    "chain": "newworld",
    "id": "b6d36090-c7f4-4ff3-9343-5b48159f8f6d",
    "name": "New World Green Bay",
    "address": "64 Godley Road, Green Bay, Auckland, 0604, New Zealand",
    "lat": -36.93074,
    "lng": 174.679184
  },
  {
    "chain": "newworld",
    "id": "bc0ebd13-e131-4efd-a226-415c40ce8c4e",
    "name": "New World Ormiston",
    "address": "240 Ormiston Road, Ormiston, Auckland, 2019, New Zealand",
    "lat": -36.9647262,
    "lng": 174.912703
  },
  {
    "chain": "newworld",
    "id": "de5595ab-1d28-46c6-9e9a-b1c3db1af827",
    "name": "New World Mount Maunganui",
    "address": "Cnr Tweed St & Maunganui Rd, Mount Maunganui, 3116, New Zealand",
    "lat": -37.653862,
    "lng": 176.198938
  },
  {
    "chain": "newworld",
    "id": "f95243ac-bfc9-483a-b10a-b681f4fc4ba2",
    "name": "New World Te Puke",
    "address": "12 Jocelyn Street, Te Puke, 3119, New Zealand",
    "lat": -37.783124,
    "lng": 176.328028
  },
  {
    "chain": "newworld",
    "id": "64c24e04-516d-40b3-958c-96b15797684a",
    "name": "New World Glenview",
    "address": "Unit 1/220 Ohaupo Road, Glenview, Hamilton, 3206, New Zealand",
    "lat": -37.822527,
    "lng": 175.287416
  },
  {
    "chain": "newworld",
    "id": "0870db3b-2e91-43b7-89aa-ce3c031b3856",
    "name": "New World Greenmeadows",
    "address": "9 Gloucester Street, Greenmeadows, Napier, 4112, New Zealand",
    "lat": -39.525324,
    "lng": 176.862409
  },
  {
    "chain": "newworld",
    "id": "04de234b-9f3e-4388-9662-7a4c8d7180c8",
    "name": "New World Merrilands",
    "address": "200 Mangorei Road, Merrilands, New Plymouth, 4312, New Zealand",
    "lat": -39.06659,
    "lng": 174.102988
  },
  {
    "chain": "newworld",
    "id": "edc986dd-a28c-4fbe-899d-5680d51f584d",
    "name": "New World Brookfield",
    "address": "89 Bellevue Road, Otumoetai, Tauranga, 3110, New Zealand",
    "lat": -37.688946,
    "lng": 176.1347
  },
  {
    "chain": "newworld",
    "id": "f5da324f-f415-4c8d-a360-ea8d2c74d49b",
    "name": "New World Whitby",
    "address": "Discovery Drive, Whitby Village Centre, Porirua, 5024, New Zealand",
    "lat": -41.117024,
    "lng": 174.893023
  },
  {
    "chain": "newworld",
    "id": "24be83cd-b9f2-47f0-8895-82867e3d4f08",
    "name": "New World Whanganui",
    "address": "374 Victoria Avenue, Whanganui, 4500, New Zealand",
    "lat": -39.926194,
    "lng": 175.041161
  },
  {
    "chain": "newworld",
    "id": "36fb31df-6b41-4a10-ac9a-db831f4f5f47",
    "name": "New World Te Rapa",
    "address": "751 Te Rapa Road, Te Rapa, Hamilton, 3200, New Zealand",
    "lat": -37.753024,
    "lng": 175.239998
  },
  {
    "chain": "newworld",
    "id": "07828d6b-4c90-430e-8ea9-37c671d375e9",
    "name": "New World Rototuna",
    "address": "Cnr Thomas & Horsham Downs Rds, Hamilton, 3210, New Zealand",
    "lat": -37.728271,
    "lng": 175.273985
  },
  {
    "chain": "newworld",
    "id": "341f876f-9a83-4882-aa79-5e5c9dc8fb2e",
    "name": "New World Wanaka",
    "address": "20 Dunmore Street, Wānaka, Wānaka, 9305, New Zealand",
    "lat": -44.6963,
    "lng": 169.135
  },
  {
    "chain": "newworld",
    "id": "5b8f8e3b-e1a0-4a11-b16b-9cfe782c124e",
    "name": "New World Prestons",
    "address": "420 Marshland Road, Marshland, Christchurch, 8083, New Zealand",
    "lat": -43.4749,
    "lng": 172.6621
  },
  {
    "chain": "newworld",
    "id": "5c3070dd-312f-4755-a92c-7607b2a694e4",
    "name": "New World Winton",
    "address": "293 Great North Road, Winton, Winton, 9720, New Zealand",
    "lat": -46.1417,
    "lng": 168.3256
  },
  {
    "chain": "newworld",
    "id": "79b03f4b-5e2b-437c-83f8-54d9dace4999",
    "name": "New World Turangi",
    "address": "19 Ohuanga Street, Turangi, 3334, New Zealand",
    "lat": -38.991014,
    "lng": 175.809118
  },
  {
    "chain": "newworld",
    "id": "7508cf88-9fd0-4e71-b2f2-d564b1decf8d",
    "name": "New World Whangaparaoa",
    "address": "580 Whangaparaoa Road, Stanmore Bay, Whangaparaoa, 0932, New Zealand",
    "lat": -36.628789,
    "lng": 174.732596
  },
  {
    "chain": "newworld",
    "id": "4664daab-1897-4e69-9117-067b4afd41bb",
    "name": "New World Onerahi",
    "address": "128 Onerahi Road, Whangarei, 0110, New Zealand",
    "lat": -35.755737,
    "lng": 174.367937
  },
  {
    "chain": "newworld",
    "id": "d48eba45-0c1c-4f5d-b836-0ed54b45c99c",
    "name": "New World Kerikeri",
    "address": "99 Kerikeri Road, Kerikeri, 0230, New Zealand",
    "lat": -35.2267,
    "lng": 173.951368
  },
  {
    "chain": "newworld",
    "id": "6b9af900-3f25-4fdb-8418-b43a596aee48",
    "name": "New World Kaikohe",
    "address": "14 Marino Place, Kaikohe, 0405, New Zealand",
    "lat": -35.408951,
    "lng": 173.801012
  },
  {
    "chain": "newworld",
    "id": "dbdfdd2a-55f7-4870-9b51-979286323647",
    "name": "New World Browns Bay",
    "address": "2 Inverness Road, Browns Bay, Auckland, 0630, New Zealand",
    "lat": -36.715961,
    "lng": 174.747287
  },
  {
    "chain": "newworld",
    "id": "403b1c6f-121c-4945-8aa8-fa53a7e59133",
    "name": "New World Hobsonville",
    "address": "120 Hobsonville Road, Hobsonville, Auckland, 0618, New Zealand",
    "lat": -36.79915,
    "lng": 174.64505
  },
  {
    "chain": "newworld",
    "id": "b012c209-9dfe-48c2-940c-acf73afebed4",
    "name": "New World Warkworth",
    "address": "6 Percy Street, Warkworth, 0910, New Zealand",
    "lat": -36.398709,
    "lng": 174.666795
  },
  {
    "chain": "newworld",
    "id": "524d7a29-550c-4d14-8f89-ec334a60cd6d",
    "name": "New World Matamata",
    "address": "45 Waharoa East Road, Matamata, 3400, New Zealand",
    "lat": -37.803437,
    "lng": 175.769835
  },
  {
    "chain": "newworld",
    "id": "c570bb70-c783-4692-aee1-6a1b235f9476",
    "name": "New World Papatoetoe",
    "address": "65 St Georges Street, Papatoetoe, Auckland, 2025, New Zealand",
    "lat": -36.9802,
    "lng": 174.853287
  },
  {
    "chain": "newworld",
    "id": "4ff026b8-a60d-4383-8f0c-6c85f5623afa",
    "name": "New World Milford",
    "address": "141 Kitchener Road, Milford, Auckland, 0620, New Zealand",
    "lat": -36.772298,
    "lng": 174.764805
  },
  {
    "chain": "newworld",
    "id": "adcd3dee-0ead-4b84-944a-809b95e0e36b",
    "name": "New World Southmall",
    "address": "187 Great South Road, Manurewa, Auckland, 2102, New Zealand",
    "lat": -37.02246,
    "lng": 174.89719
  },
  {
    "chain": "newworld",
    "id": "0f82d3fe-acd0-4e98-b3e7-fbabbf8b8ef5",
    "name": "New World Orewa",
    "address": "11 Moana Avenue, Orewa, 0931, New Zealand",
    "lat": -36.586612,
    "lng": 174.69366
  },
  {
    "chain": "newworld",
    "id": "3ca6692b-e2a3-4d51-95b6-d061b9541e6c",
    "name": "New World Mt Roskill",
    "address": "53 May Road, Mt Roskill, Auckland, 1041, New Zealand",
    "lat": -36.908622,
    "lng": 174.734362
  },
  {
    "chain": "newworld",
    "id": "513fc849-3dbe-4333-a148-4edee5baef67",
    "name": "New World Devonport",
    "address": "35 Bartley Terrace, Devonport, Auckland, 0624, New Zealand",
    "lat": -36.82951,
    "lng": 174.796193
  },
  {
    "chain": "newworld",
    "id": "91e4dddd-aed7-4ccc-ad0b-dfe25805a495",
    "name": "New World Remuera",
    "address": "10 Clonbern Road, Remuera, Auckland, 1050, New Zealand",
    "lat": -36.88171,
    "lng": 174.79751
  },
  {
    "chain": "newworld",
    "id": "ef977d89-f3d8-4e8b-8a48-b895ded38646",
    "name": "New World Papakura",
    "address": "29-31 East Street, Auckland, 2110, New Zealand",
    "lat": -37.064268,
    "lng": 174.941101
  },
  {
    "chain": "newworld",
    "id": "60928d93-06fa-4d8f-92a6-8c359e7e846d",
    "name": "New World Metro Auckland",
    "address": "125 Queen Street, Auckland Central, Auckland, 1010, New Zealand",
    "lat": -36.846405,
    "lng": 174.765935
  },
  {
    "chain": "newworld",
    "id": "b42476bd-bded-4c80-827e-e1d587096f54",
    "name": "New World Ngaruawahia",
    "address": "7 Galileo Street, Ngaruawahia, 3720, New Zealand",
    "lat": -37.667256,
    "lng": 175.150107
  },
  {
    "chain": "newworld",
    "id": "1fa53d02-1ed5-4dd5-b0ac-fd280425c19a",
    "name": "New World Masterton",
    "address": "11 Bruce Street, Masterton, 5810, New Zealand",
    "lat": -40.948688,
    "lng": 175.665517
  },
  {
    "chain": "newworld",
    "id": "f54433e6-5c6c-41b9-a5e2-d7502f454da8",
    "name": "New World Kapiti",
    "address": "159 Kapiti Road, Paraparaumu, 5032, New Zealand",
    "lat": -40.905625,
    "lng": 174.994131
  },
  {
    "chain": "newworld",
    "id": "2fe74bf7-5123-4faa-8fcb-97db954a714d",
    "name": "New World Waihi",
    "address": "35 Kenny Street, Waihi, 3610, New Zealand",
    "lat": -37.393116,
    "lng": 175.839644
  },
  {
    "chain": "newworld",
    "id": "63190876-2bd4-4562-ae34-bb5caebab4f9",
    "name": "New World Birkenhead",
    "address": "180 Mokoia Road, Chatswood, Auckland, 0626, New Zealand",
    "lat": -36.811428,
    "lng": 174.711486
  },
  {
    "chain": "newworld",
    "id": "01076456-6c8a-42c3-a647-2e70a94c4e6c",
    "name": "New World Morrinsville",
    "address": "89 Thames Street, Morrinsville, 3300, New Zealand",
    "lat": -37.659507,
    "lng": 175.522299
  },
  {
    "chain": "newworld",
    "id": "517424bd-8840-49e7-8206-58f4da24b1d7",
    "name": "New World Taumarunui",
    "address": "10 Hakiaha Street, Taumarunui, 3920, New Zealand",
    "lat": -38.8829294,
    "lng": 175.2579086
  },
  {
    "chain": "newworld",
    "id": "a799b706-07b8-4825-9524-95b03c9e0b14",
    "name": "New World Westend",
    "address": "247 Old Taupo Road, Hillcrest, Rotorua, 3015, New Zealand",
    "lat": -38.146066,
    "lng": 176.237248
  },
  {
    "chain": "newworld",
    "id": "4db31fed-1e21-4884-82a5-cfaa178af8ac",
    "name": "New World Cambridge",
    "address": "14 Anzac Street, Cambridge, 3434, New Zealand",
    "lat": -37.893425,
    "lng": 175.472202
  },
  {
    "chain": "newworld",
    "id": "1fc7bc09-1d0c-4a88-a9f4-5f1536d797dd",
    "name": "New World Regent",
    "address": "167 Bank Street, Regent, Whangarei, 0112, New Zealand",
    "lat": -35.716277,
    "lng": 174.321962
  },
  {
    "chain": "newworld",
    "id": "8d2ceac4-9520-4b8e-82bb-7867873580da",
    "name": "New World Broadway",
    "address": "Broadway Avenue, Palmerston North, 4414, New Zealand",
    "lat": -40.348551,
    "lng": 175.623806
  },
  {
    "chain": "newworld",
    "id": "e42fdd7c-6a4e-48d5-964c-5654fd36992b",
    "name": "New World Opotiki",
    "address": "19 Bridge Street, Opotiki, 3122, New Zealand",
    "lat": -38.011812,
    "lng": 177.275962
  },
  {
    "chain": "newworld",
    "id": "c8998066-d39b-401c-aa6b-d6d18f8d122f",
    "name": "New World New Lynn",
    "address": "2-6 Crown Lynn Place, New Lynn, Auckland, 0600, New Zealand",
    "lat": -36.910865,
    "lng": 174.685569
  },
  {
    "chain": "newworld",
    "id": "c3a42e9d-ac58-4abf-be43-17920c720540",
    "name": "New World Stonefields",
    "address": "100 Lunn Avenue, Mt Wellington, Auckland, 1072, New Zealand",
    "lat": -36.890274,
    "lng": 174.831971
  },
  {
    "chain": "newworld",
    "id": "491d26a4-78fd-4c6e-85e9-5b67fd97e2cc",
    "name": "New World Eastridge",
    "address": "209 Kepa Road, Mission Bay, Auckland, 1071, New Zealand",
    "lat": -36.861179,
    "lng": 174.82901
  },
  {
    "chain": "newworld",
    "id": "773ad0a0-024e-46c5-a94b-df1cf86d25cc",
    "name": "New World Albany",
    "address": "219 Don McKinnon Drive, Albany, Auckland, 0632, New Zealand",
    "lat": -36.728207,
    "lng": 174.710519
  },
  {
    "chain": "newworld",
    "id": "471d0657-713c-430a-816f-2ca8448e6b35",
    "name": "New World Aokautere",
    "address": "194-200 Ruapehu Drive, Summerhill, Palmerston North, 4410, New Zealand",
    "lat": -40.387171,
    "lng": 175.639157
  },
  {
    "chain": "newworld",
    "id": "d4408e0f-5268-42c2-ba76-2bc9732d4316",
    "name": "New World Island Bay",
    "address": "6 Medway Street, Island Bay, Wellington, 6023, New Zealand",
    "lat": -41.334534,
    "lng": 174.772497
  },
  {
    "chain": "newworld",
    "id": "c387ac97-5e0a-43ed-9c93-f1edccda298d",
    "name": "New World Botany",
    "address": "588 Chapel Road, East Tamaki, Auckland, 2013, New Zealand",
    "lat": -36.933874,
    "lng": 174.911485
  },
  {
    "chain": "newworld",
    "id": "1926eed9-3d44-4339-9f6e-23c96becab07",
    "name": "New World Porirua",
    "address": "2 Walton Leigh Avenue, Porirua City Centre, Porirua, 5022, New Zealand",
    "lat": -41.136386,
    "lng": 174.841919
  },
  {
    "chain": "newworld",
    "id": "412c5dcf-142c-4133-b766-7bd21c30ae01",
    "name": "New World Whitianga",
    "address": "1 Joan Gaskell Drive, Whitianga, 3510, New Zealand",
    "lat": -36.834308,
    "lng": 175.699435
  },
  {
    "chain": "newworld",
    "id": "c4d78c33-1f9c-4039-8cd5-82ddb43fbe16",
    "name": "New World Whangamata",
    "address": "308 Aickin Road, Whangamata, 3620, New Zealand",
    "lat": -37.201793,
    "lng": 175.867411
  },
  {
    "chain": "newworld",
    "id": "177c82e0-7343-434c-8b98-9c20e72561c2",
    "name": "New World Hillcrest",
    "address": "280 Cambridge Road, Hillcrest, Hamilton, 3216, New Zealand",
    "lat": -37.801952,
    "lng": 175.322549
  },
  {
    "chain": "newworld",
    "id": "3a5fd4b8-6ea0-4a6c-aeec-5af83e093322",
    "name": "New World Thorndon",
    "address": "150 Molesworth Street, Thorndon, Wellington, 6011, New Zealand",
    "lat": -41.274006,
    "lng": 174.778067
  },
  {
    "chain": "newworld",
    "id": "686c8e35-aa87-40e9-b46e-8ffbad4713aa",
    "name": "New World Kumeu",
    "address": "108-110 Main Road, Kumeu, Auckland, 0810, New Zealand",
    "lat": -36.774933,
    "lng": 174.553672
  },
  {
    "chain": "newworld",
    "id": "0d045690-bd75-42d8-a7bc-ee44aa57fc61",
    "name": "New World Waiuku",
    "address": "25-49 Bowen Street, Waiuku, 2123, New Zealand",
    "lat": -37.249975,
    "lng": 174.727925
  },
  {
    "chain": "newworld",
    "id": "d4f24174-f962-4db1-9024-75495bb2dfbb",
    "name": "New World Churton Park",
    "address": "69 Lakewood Avenue, Churton Park, Wellington, 6037, New Zealand",
    "lat": -41.203041,
    "lng": 174.807839
  },
  {
    "chain": "newworld",
    "id": "aed206ae-c0ba-4c81-b7e9-7b420bc3616c",
    "name": "New World Dannevirke",
    "address": "Denmark Street, Dannevirke, 4930, New Zealand",
    "lat": -40.210911,
    "lng": 176.096788
  },
  {
    "chain": "newworld",
    "id": "11b389ec-b197-4476-9b7f-2eaeffa2c1c9",
    "name": "New World Ohakune",
    "address": "12 Goldfinch Street, Ohakune, 4625, New Zealand",
    "lat": -39.41772,
    "lng": 175.39904
  },
  {
    "chain": "newworld",
    "id": "ebcc2edb-73bd-4d8e-b6f3-528849677b62",
    "name": "New World Foxton",
    "address": "Cnr Main and Whyte Streets, FOXTON, 4814, New Zealand",
    "lat": -40.472517,
    "lng": 175.281707
  },
  {
    "chain": "newworld",
    "id": "be37802e-1355-466e-9a1b-1ede5a099705",
    "name": "New World Hastings",
    "address": "400 Heretaunga Street East, Hastings, 4122, New Zealand",
    "lat": -39.644715,
    "lng": 176.847154
  },
  {
    "chain": "newworld",
    "id": "745d0bda-4b4f-4e4c-ab1f-6d77512f92f4",
    "name": "New World Hutt City",
    "address": "Bloomfield Terrace, Lower Hutt, 5010, New Zealand",
    "lat": -41.209025,
    "lng": 174.90804
  },
  {
    "chain": "newworld",
    "id": "bbe5aa58-69dd-4b29-abe6-58670234b3b7",
    "name": "New World Tawa",
    "address": "37 Oxford Street, Tawa, Wellington, 5028, New Zealand",
    "lat": -41.169962,
    "lng": 174.82611
  },
  {
    "chain": "newworld",
    "id": "7daec5c2-789a-4577-ba1f-39e730acdd27",
    "name": "New World Karori",
    "address": "236 Karori Road, Karori, Wellington, 6012, New Zealand",
    "lat": -41.284257,
    "lng": 174.738052
  },
  {
    "chain": "newworld",
    "id": "c78b7034-7f10-480a-b502-2e5c4066a790",
    "name": "New World Levin",
    "address": "21 Bath Street, Levin, 5510, New Zealand",
    "lat": -40.623065,
    "lng": 175.282791
  },
  {
    "chain": "newworld",
    "id": "514b1db1-fe88-4e79-a6dd-f1e0d4d4c01f",
    "name": "New World Te Kuiti",
    "address": "39-51 Rora Street, Te Kuiti, 3910, New Zealand",
    "lat": -38.331839,
    "lng": 175.16319
  },
  {
    "chain": "newworld",
    "id": "1ee51b21-c2c8-42c4-b01e-8ef081738e23",
    "name": "New World Newlands",
    "address": "Cnr Bracken and Newlands Road, Newlands, Wellington, 6037, New Zealand",
    "lat": -41.223472,
    "lng": 174.823202
  },
  {
    "chain": "newworld",
    "id": "ff680fec-3a34-4666-99ed-ab1a9d1c6ba0",
    "name": "New World Newtown",
    "address": "195 Riddiford Street, Wellington, 6021, New Zealand",
    "lat": -41.314466,
    "lng": 174.780574
  },
  {
    "chain": "newworld",
    "id": "cb3f240a-a157-490c-9e80-f537d202ef49",
    "name": "New World Howick",
    "address": "77 Union Road, Howick, Auckland, 2014, New Zealand",
    "lat": -36.903857,
    "lng": 174.925067
  },
  {
    "chain": "newworld",
    "id": "997b5318-0d47-4eac-b4ec-bbbd9feb8ae3",
    "name": "New World Onekawa",
    "address": "34 Maadi Road, Onekawa, Napier, 4110, New Zealand",
    "lat": -39.508662,
    "lng": 176.887458
  },
  {
    "chain": "newworld",
    "id": "1257ed9a-1790-4ad0-beae-383397043e35",
    "name": "New World Carterton",
    "address": "60 High Street South, -, Carterton, 5713, New Zealand",
    "lat": -41.026035,
    "lng": 175.526349
  },
  {
    "chain": "newworld",
    "id": "b525d98f-8df5-415f-837e-abb793821e1e",
    "name": "New World Stokes Valley",
    "address": "14 Oates Street, Stokes Valley, Lower Hutt, 5019, New Zealand",
    "lat": -41.174103,
    "lng": 174.980844
  },
  {
    "chain": "newworld",
    "id": "02874261-edfe-4daa-886c-09429e2d06d7",
    "name": "New World Stratford",
    "address": "124 Regan Street, Stratford, 4332, New Zealand",
    "lat": -39.337111,
    "lng": 174.286329
  },
  {
    "chain": "newworld",
    "id": "89ba1656-0ad7-4af0-8694-08bf335e99b9",
    "name": "New World Wellington City",
    "address": "279 Wakefield Street, Wellington, 6011, New Zealand",
    "lat": -41.292409,
    "lng": 174.784342
  },
  {
    "chain": "newworld",
    "id": "c032987b-0387-4fc0-bb44-ce7510e35335",
    "name": "New World Pukekohe",
    "address": "17 Paerata Road, Pukekohe, Auckland, 2120, New Zealand",
    "lat": -37.18988,
    "lng": 174.90306
  },
  {
    "chain": "newworld",
    "id": "c15270b3-4ced-4b8e-be01-16b9fc31c4c7",
    "name": "New World Tokoroa",
    "address": "84 Bridge Street, Tokoroa, 3420, New Zealand",
    "lat": -38.218917,
    "lng": 175.867537
  },
  {
    "chain": "newworld",
    "id": "420eff4b-5266-4667-8943-a21caf4b1b03",
    "name": "New World Khandallah",
    "address": "26 Ganges Road, Khandallah, Wellington, 6035, New Zealand",
    "lat": -41.247527,
    "lng": 174.791469
  },
  {
    "chain": "newworld",
    "id": "e2852742-1bb5-42a5-8635-4c4e7c7cb758",
    "name": "New World Marton",
    "address": "427 Wellington Road, Marton, 4710, New Zealand",
    "lat": -40.07666,
    "lng": 175.379646
  },
  {
    "chain": "newworld",
    "id": "38b074c4-0e5a-4bd5-b743-d30f28d94982",
    "name": "New World Metro",
    "address": "68- 70 Willis Street, Wellington Central, Wellington, 6011, New Zealand",
    "lat": -41.287948,
    "lng": 174.775268
  },
  {
    "chain": "newworld",
    "id": "5255b27a-b224-4f58-a424-144e81ecf244",
    "name": "New World Miramar",
    "address": "48 Miramar Avenue, Miramar, WELLINGTON, 6022, New Zealand",
    "lat": -41.315835,
    "lng": 174.814635
  },
  {
    "chain": "newworld",
    "id": "55d4fe03-e82e-44a8-8324-57f3afcf16ba",
    "name": "New World New Plymouth",
    "address": "78 Courtenay Street, New Plymouth, 4310, New Zealand",
    "lat": -39.05782,
    "lng": 174.07774
  },
  {
    "chain": "newworld",
    "id": "5dde0d09-05ca-4b78-ab83-00e47233cf55",
    "name": "New World Otaki",
    "address": "155-163 Main Highway, Otaki, 5512, New Zealand",
    "lat": -40.763486,
    "lng": 175.153556
  },
  {
    "chain": "newworld",
    "id": "b01a01ac-d6ef-45ef-b9fe-d66036d55b56",
    "name": "New World Pahiatua",
    "address": "101 Main Street, Pahiatua, 4910, New Zealand",
    "lat": -40.452412,
    "lng": 175.841836
  },
  {
    "chain": "newworld",
    "id": "6defcd27-e944-45ad-982f-768ab3b4c2ac",
    "name": "New World Paremata",
    "address": "93-97 Mana Esplanade, Paremata, Porirua, 5026, New Zealand",
    "lat": -41.0944,
    "lng": 174.868615
  },
  {
    "chain": "newworld",
    "id": "59b56cc6-645c-4fa8-836b-c667662d7ec4",
    "name": "New World Pioneer",
    "address": "179-197 Main Street, Palmerston North, 4412, New Zealand",
    "lat": -40.359638,
    "lng": 175.600741
  },
  {
    "chain": "newworld",
    "id": "692b45a2-2ab9-49de-adc3-e4a0ddd661a5",
    "name": "New World Silverstream",
    "address": "28 Whitemans Road, Silverstream, Upper Hutt, 5019, New Zealand",
    "lat": -41.148436,
    "lng": 175.012536
  },
  {
    "chain": "newworld",
    "id": "65201d94-8805-4be8-b1ba-f547d6bf7ecd",
    "name": "New World Taihape",
    "address": "112 Hautapu Street, Taihape, 4720, New Zealand",
    "lat": -39.67708,
    "lng": 175.798534
  },
  {
    "chain": "newworld",
    "id": "55231137-b7be-48f2-b8a0-6aaed59f4540",
    "name": "New World Waikanae",
    "address": "5 Parata Street, Waikanae, 5036, New Zealand",
    "lat": -40.874943,
    "lng": 175.066744
  },
  {
    "chain": "newworld",
    "id": "d83b5f5e-db6e-4696-823e-5940493ef41c",
    "name": "New World Temuka",
    "address": "185 King Street, Temuka, Temuka, 7920, New Zealand",
    "lat": -44.2413,
    "lng": 171.2763
  },
  {
    "chain": "newworld",
    "id": "b2f012df-3c55-4bca-98ba-e30c3cd3aa70",
    "name": "New World Waipukurau",
    "address": "27 Russell Street, Waipukurau, 4200, New Zealand",
    "lat": -39.99467,
    "lng": 176.55584
  },
  {
    "chain": "newworld",
    "id": "83f2d5fc-132b-4603-aaaf-323e4a426fa0",
    "name": "New World Wairoa",
    "address": "51 Queen Street, Wairoa, 4108, New Zealand",
    "lat": -39.033806,
    "lng": 177.418651
  },
  {
    "chain": "newworld",
    "id": "99798e55-18bb-4f16-9f3e-425c555111a7",
    "name": "New World Waitara",
    "address": "42 Queen Street, Waitara, 4320, New Zealand",
    "lat": -39.000167,
    "lng": 174.236804
  },
  {
    "chain": "newworld",
    "id": "ad3ea12c-d9c1-4640-908c-feb9d3c79c11",
    "name": "New World Inglewood",
    "address": "46 Matai Street, Inglewood, 4330, New Zealand",
    "lat": -39.158214,
    "lng": 174.20708
  },
  {
    "chain": "newworld",
    "id": "8e5b742c-0957-4b97-b9e2-290d75c02046",
    "name": "New World Kaikoura",
    "address": "124 Beach Road, Kaikoura, Kaikoura, 7300, New Zealand",
    "lat": -42.3877,
    "lng": 173.6804
  },
  {
    "chain": "newworld",
    "id": "756356f9-9985-40c9-a368-bf1ea8072b0e",
    "name": "New World Blenheim",
    "address": "4 Freswick Street, Blenheim, Blenheim, 7201, New Zealand",
    "lat": -41.5141,
    "lng": 173.9613
  },
  {
    "chain": "newworld",
    "id": "0637c08c-ac36-4940-8582-38e44a4812fa",
    "name": "New World Northwood",
    "address": "2 Mounter Avenue, Northwood, Christchurch, 8051, New Zealand",
    "lat": -43.4596,
    "lng": 172.6225
  },
  {
    "chain": "newworld",
    "id": "fc91d59f-6ab5-4447-8737-125e09e8e50e",
    "name": "New World Ferry Road",
    "address": "7/11 St Johns Street, Woolston, Christchurch, 8062, New Zealand",
    "lat": -43.5492,
    "lng": 172.6842
  },
  {
    "chain": "newworld",
    "id": "b7fe0c9e-24e9-46f2-a59a-95dce1725b06",
    "name": "New World Motueka",
    "address": "271 High Street, Motueka, Motueka, 7120, New Zealand",
    "lat": -41.1146,
    "lng": 173.0124
  },
  {
    "chain": "newworld",
    "id": "3ee7214b-6df4-4fdb-9dd6-3b2fc252ba6b",
    "name": "New World Wigram",
    "address": "51 Skyhawk Road, Wigram, Christchurch, 8042, New Zealand",
    "lat": -43.5532267333,
    "lng": 172.5580681167
  },
  {
    "chain": "newworld",
    "id": "80bebcaf-d5a3-4ca6-a999-beab902aef55",
    "name": "New World Balclutha",
    "address": "9 Lanark Street, Balclutha, 9230, New Zealand",
    "lat": -46.2381,
    "lng": 169.7437
  },
  {
    "chain": "newworld",
    "id": "ff528de5-233a-4cf6-a3a9-bc140565367e",
    "name": "New World Three Parks",
    "address": "83 Sir Tim Wallis Drive, Wanaka, Wanaka, 9305, New Zealand",
    "lat": -44.6993,
    "lng": 169.1553
  },
  {
    "chain": "newworld",
    "id": "bfe3a4ae-2f6d-46ed-ba60-28451a4807bf",
    "name": "New World Lincoln",
    "address": "77 Gerald Street, Lincoln, Lincoln, 7608, New Zealand",
    "lat": -43.642,
    "lng": 172.4739
  },
  {
    "chain": "newworld",
    "id": "12c83069-9220-466b-9145-6ac5706d841c",
    "name": "New World Timaru",
    "address": "145 Wai-Iti Road, Highfield, Timaru, 7910, New Zealand",
    "lat": -44.389894977891,
    "lng": 171.22618470502
  },
  {
    "chain": "newworld",
    "id": "50a98f3b-ffbd-4229-84bc-bfd3c956119f",
    "name": "New World Centre City",
    "address": "133 Great King Street, Dunedin Central, Dunedin, 9016, New Zealand",
    "lat": -45.8713,
    "lng": 170.5083
  },
  {
    "chain": "newworld",
    "id": "bae1da58-ac6b-4ef2-816d-4932691218d1",
    "name": "New World St Martins",
    "address": "92 Wilsons Road, Saint Martins, Christchurch, 8023, New Zealand",
    "lat": -43.5578,
    "lng": 172.6548
  },
  {
    "chain": "newworld",
    "id": "a0d86b5f-fdf4-44d1-b7a2-f418bdb37f4e",
    "name": "New World Stanmore",
    "address": "288 Stanmore Road, Richmond, Christchurch, 8013, New Zealand",
    "lat": -43.5203,
    "lng": 172.6568
  },
  {
    "chain": "newworld",
    "id": "401accb9-6430-45a1-888d-29337ab34f12",
    "name": "New World Westport",
    "address": "244 Palmerston St, Nelson, Westport, 7825, New Zealand",
    "lat": -41.7575,
    "lng": 171.5989
  },
  {
    "chain": "newworld",
    "id": "afbe3446-1f57-4dca-9a58-0c7d5a4a6020",
    "name": "New World Greymouth",
    "address": "Cnr High & Marlborough Streets, Greymouth, Greymouth, 7805, New Zealand",
    "lat": -42.4617,
    "lng": 171.1961
  },
  {
    "chain": "newworld",
    "id": "b007db90-0a16-47d8-9a89-407be8496d9a",
    "name": "New World Mosgiel",
    "address": "10 Hartstonge Avenue, Mosgiel, Mosgiel, 9024, New Zealand",
    "lat": -45.8725,
    "lng": 170.3493
  },
  {
    "chain": "newworld",
    "id": "91b26327-b240-4778-a3d8-190dfc8c16f3",
    "name": "New World Nelson City",
    "address": "Cnr Vanguard and Gloucester Street, Nelson South, Nelson, 7010, New Zealand",
    "lat": -41.2757,
    "lng": 173.2781
  },
  {
    "chain": "newworld",
    "id": "b3158cd8-72b9-40e5-8c4e-abd43c1be305",
    "name": "New World Bishopdale",
    "address": "41 Bishopdale Court, Bishopdale, Christchurch, 8053, New Zealand",
    "lat": -43.4885,
    "lng": 172.5872
  },
  {
    "chain": "newworld",
    "id": "f7f6ce3e-c7f6-459a-8466-e29d868257d1",
    "name": "New World Ravenswood",
    "address": "10 Bob Robertson Drive, Woodend, 7691, New Zealand",
    "lat": -43.308,
    "lng": 172.6713
  },
  {
    "chain": "newworld",
    "id": "81f807e9-1879-484c-b27e-ded56245c6a4",
    "name": "New World Fendalton",
    "address": "19-23 Memorial Avenue, Fendalton, Christchurch, 8053, New Zealand",
    "lat": -43.5179,
    "lng": 172.5883
  },
  {
    "chain": "newworld",
    "id": "4f76214d-40a5-4c71-a94f-81d45f3f0a59",
    "name": "New World Gardens",
    "address": "6 North Road, North East Valley, Dunedin, 9010, New Zealand",
    "lat": -45.8549,
    "lng": 170.5197
  },
  {
    "chain": "newworld",
    "id": "04ba529d-3dee-4f86-adb6-62b0111114d7",
    "name": "New World Waimate",
    "address": "95 Queen Street, Waimate, Waimate, 7924, New Zealand",
    "lat": -44.7337,
    "lng": 171.0472
  },
  {
    "chain": "newworld",
    "id": "95d161ea-9a31-4fca-acbe-96f271d627df",
    "name": "New World Halswell",
    "address": "346 Halswell Road, Halswell, Christchurch, 8025, New Zealand",
    "lat": -43.5806,
    "lng": 172.566
  },
  {
    "chain": "newworld",
    "id": "421d563e-ce40-4d5c-a79c-4afb521fc5b0",
    "name": "New World Oamaru",
    "address": "72 Wansbeck Street, Oamaru, Oamaru, 9400, New Zealand",
    "lat": -45.102,
    "lng": 170.9548
  },
  {
    "chain": "newworld",
    "id": "30a90cf9-3547-46d1-b8b1-cc9ff4af5f88",
    "name": "New World Ashburton",
    "address": "75 Moore Street, Ashburton, 7700, New Zealand",
    "lat": -43.9039,
    "lng": 171.7439
  },
  {
    "chain": "newworld",
    "id": "810832cb-2748-4e87-bc17-929eab5a5a61",
    "name": "New World Feilding",
    "address": "42 Aorangi Street, Feilding, 4702, New Zealand",
    "lat": -40.228015,
    "lng": 175.569532
  },
  {
    "chain": "newworld",
    "id": "e3a57a0b-156f-4994-a06a-921df65c20cc",
    "name": "New World Stoke",
    "address": "107 Neale Avenue, Stoke, Nelson, 7011, New Zealand",
    "lat": -41.3127,
    "lng": 173.2327
  },
  {
    "chain": "newworld",
    "id": "6ea5a1cf-56b8-44eb-856c-fd916560e92e",
    "name": "New World Queenstown",
    "address": "1/12 Hawthorne Dr, Remarkables Park, Queenstown, 9300, New Zealand",
    "lat": -45.0258,
    "lng": 168.7419
  },
  {
    "chain": "newworld",
    "id": "5eb8d7a2-c5e4-4046-a17e-be2806626fd7",
    "name": "New World Te Kauwhata",
    "address": "6-8 Main Road, Te Kauwhata, 3710, New Zealand",
    "lat": -37.404219,
    "lng": 175.143247
  },
  {
    "chain": "newworld",
    "id": "1898a189-acf3-4320-8704-7a9cc6b3924d",
    "name": "New World Shore City",
    "address": "52-56 Anzac Street, Takapuna, Auckland, 0622, New Zealand",
    "lat": -36.78756,
    "lng": 174.77005
  },
  {
    "chain": "newworld",
    "id": "f0c21eab-1919-4cba-ac00-5b795947cdcb",
    "name": "New World Long Bay",
    "address": "55B Glenvar Ridge Road, Long Bay, Auckland, 0630, New Zealand",
    "lat": -36.684964,
    "lng": 174.73973
  },
  {
    "chain": "newworld",
    "id": "ca27a97f-03d4-4969-9400-e3af61c99816",
    "name": "New World Gore",
    "address": "2 Irk Street, Gore, Gore, 9710, New Zealand",
    "lat": -46.0993,
    "lng": 168.9427
  },
  {
    "chain": "newworld",
    "id": "c6abac35-b75f-4a02-9b43-7ad5a7c7aa37",
    "name": "New World Ilam",
    "address": "47C/57C Peer Street, Upper Riccarton, Christchurch, 8041, New Zealand",
    "lat": -43.5260484333,
    "lng": 172.5699320333
  },
  {
    "chain": "newworld",
    "id": "a7c2a0cc-d39d-4b26-93ba-09adaa3a8bf6",
    "name": "New World Elles Road",
    "address": "244 Elles Road, Strathern, Invercargill, 9812, New Zealand",
    "lat": -46.4269544,
    "lng": 168.36167166667
  },
  {
    "chain": "newworld",
    "id": "e197b67e-2cf9-4bae-bae5-5b8ffdccfa87",
    "name": "New World Kaiapoi",
    "address": "52 Charles Street, Kaiapoi, Kaiapoi, 7630, New Zealand",
    "lat": -43.3823,
    "lng": 172.6596
  },
  {
    "chain": "newworld",
    "id": "10de9574-cf98-4bc8-973d-3d3e36cb0c4d",
    "name": "New World Waitaki",
    "address": "402 Thames Highway, Oamaru North, Oamaru, 9400, New Zealand",
    "lat": -45.0766,
    "lng": 170.9849
  },
  {
    "chain": "newworld",
    "id": "84c3115a-fe09-4bc3-b373-f43cc9e9627c",
    "name": "New World Rolleston",
    "address": "92 Rolleston Drive, Rolleston, Rolleston, 7614, New Zealand",
    "lat": -43.5968,
    "lng": 172.3825
  },
  {
    "chain": "newworld",
    "id": "d0914aa0-ab30-4354-a223-6ba9ef6069c1",
    "name": "New World Windsor",
    "address": "51 Windsor Street, Windsor, Invercargill, 9810, New Zealand",
    "lat": -46.3954,
    "lng": 168.3661
  },
  {
    "chain": "newworld",
    "id": "5080816d-825d-4a6e-9835-a93d986b1ee0",
    "name": "New World Rangiora",
    "address": "10 Good Street, Rangiora, Rangiora, 7400, New Zealand",
    "lat": -43.302554280866,
    "lng": 172.594487955856
  },
  {
    "chain": "newworld",
    "id": "9829c627-42c8-4ad7-b550-f9dba9fcd44a",
    "name": "New World Cromwell",
    "address": "2 Murray Terrace, Cromwell, Cromwell, 9310, New Zealand",
    "lat": -45.0375,
    "lng": 169.1943
  },
  {
    "chain": "newworld",
    "id": "51ee2a79-4693-410c-9287-66940847736d",
    "name": "New World Newmarket",
    "address": "42 Nuffield Street, Newmarket, Auckland, 1023, New Zealand",
    "lat": -36.8709201,
    "lng": 174.778261
  },
  {
    "chain": "newworld",
    "id": "c1aaac72-38c0-4cc0-ad05-f241047d88c5",
    "name": "New World Durham Street",
    "address": "175 Durham Street South, Christchurch Central, Christchurch, 8011, New Zealand",
    "lat": -43.5388269667,
    "lng": 172.6332807333
  },
  {
    "chain": "newworld",
    "id": "6739e54f-ffab-47b9-9fe1-899d91a7ad78",
    "name": "New World Mangawhai",
    "address": "83 Molesworth Drive, Mangawhai, 0505, New Zealand",
    "lat": -36.1124401,
    "lng": 174.572448
  },
  {
    "chain": "newworld",
    "id": "2de22d8e-54d4-4575-be10-0d783324ec75",
    "name": "New World Hokitika",
    "address": "116 Revell Street, Hokitika, Hokitika, 7810, New Zealand",
    "lat": -42.7161,
    "lng": 170.9638
  },
  {
    "chain": "newworld",
    "id": "8d098344-5474-4626-ae1c-90ed0f57306f",
    "name": "New World Alexandra",
    "address": "89 Centennial Avenue, Alexandra, Alexandra, 9320, New Zealand",
    "lat": -45.2499,
    "lng": 169.387
  },
  {
    "chain": "newworld",
    "id": "c3f80f70-0ad3-409a-b60a-9eac6ad38681",
    "name": "New World The Sands",
    "address": "255 The Boulevard, Papamoa East, Tauranga, 3118, New Zealand",
    "lat": -37.7273,
    "lng": 176.3464
  },
  {
    "chain": "newworld",
    "id": "871ff39f-99b5-4030-b035-b2dab7225082",
    "name": "New World Point Chevalier",
    "address": "1132 Great North Road, Point Chevalier, Auckland, 1022, New Zealand",
    "lat": -36.8699276,
    "lng": 174.7126578
  },
  {
    "chain": "newworld",
    "id": "d999418f-c2ca-4748-b56b-15ee82c6e85e",
    "name": "New World Havelock North",
    "address": "34 Havelock Road, Havelock North, 4130, New Zealand",
    "lat": -39.668128,
    "lng": 176.875873
  },
  {
    "chain": "newworld",
    "id": "dae2d4e3-9b97-41f4-a969-4eded0bd3554",
    "name": "New World Mt Albert",
    "address": "1 Alberton Avenue, Mt Albert, Auckland, 1025, New Zealand",
    "lat": -36.880146,
    "lng": 174.72622
  },
  {
    "chain": "newworld",
    "id": "f145f120-ba19-4524-9fc5-e8caf516e209",
    "name": "New World Kawerau",
    "address": "Tarawera Court, Kawerau, 3127, New Zealand",
    "lat": -38.085853,
    "lng": 176.700944
  },
  {
    "chain": "newworld",
    "id": "96c43bec-8c0d-4752-b417-266546fddda1",
    "name": "New World Whakatane",
    "address": "51 Kakahoroa Drive, Whakatane, 3120, New Zealand",
    "lat": -37.950929,
    "lng": 176.993759
  },
  {
    "chain": "woolworths",
    "id": "woolworths-albert-street",
    "name": "Woolworths Albert Street",
    "address": "29 Customs Street West, City Centre, Auckland, 1010, New Zealand",
    "lat": -36.8439036,
    "lng": 174.7652319
  },
  {
    "chain": "woolworths",
    "id": "woolworths-amberley",
    "name": "Woolworths Amberley",
    "address": "121 Carters Road, Amberley, 7410, New Zealand",
    "lat": -43.156362,
    "lng": 172.7321431
  },
  {
    "chain": "woolworths",
    "id": "woolworths-9181",
    "name": "Woolworths Ashburton",
    "address": "Peter Street, Hampstead, Ashburton, 7700, New Zealand",
    "lat": -43.9023546,
    "lng": 171.7525776
  },
  {
    "chain": "woolworths",
    "id": "woolworths-9094",
    "name": "Woolworths Auckland City",
    "address": "76 Quay Street, Auckland Central, Auckland, 1010, New Zealand",
    "lat": -36.8452518,
    "lng": 174.772811
  },
  {
    "chain": "woolworths",
    "id": "woolworths-9283",
    "name": "Woolworths Auckland Victoria Street West",
    "address": "19-25 Victoria Street West, New Zealand",
    "lat": -36.8486588,
    "lng": 174.7647089
  },
  {
    "chain": "woolworths",
    "id": "woolworths-avonhead",
    "name": "Woolworths Avonhead",
    "address": "210 Withells Road, Avonhead, Christchurch, 8042, New Zealand",
    "lat": -43.5111733,
    "lng": 172.5572753
  },
  {
    "chain": "woolworths",
    "id": "woolworths-9459",
    "name": "Woolworths Balclutha",
    "address": "Charlotte Street, Balclutha, 9230, New Zealand",
    "lat": -46.2363735,
    "lng": 169.7410674
  },
  {
    "chain": "woolworths",
    "id": "woolworths-bay-of-islands",
    "name": "Woolworths Bay of Islands",
    "address": "Puketona Road, Bay of Islands, 0247, New Zealand",
    "lat": -35.2790833,
    "lng": 174.080957
  },
  {
    "chain": "woolworths",
    "id": "woolworths-9415",
    "name": "Woolworths Bayfair",
    "address": "1/19 Girven Road, 3116, New Zealand",
    "lat": -37.6738124,
    "lng": 176.2220721
  },
  {
    "chain": "woolworths",
    "id": "woolworths-9177",
    "name": "Woolworths Beachlands",
    "address": "Mahutonga Avenue, Franklin, 2018, New Zealand",
    "lat": -36.8898097,
    "lng": 175.0103714
  },
  {
    "chain": "woolworths",
    "id": "woolworths-belfast",
    "name": "Woolworths Belfast",
    "address": "755 Main North Road, Belfast, Christchurch, 8051, New Zealand",
    "lat": -43.447751,
    "lng": 172.6283488
  },
  {
    "chain": "woolworths",
    "id": "woolworths-9143",
    "name": "Woolworths Bethlehem",
    "address": "State Highway 2, Bethlehem, 3146, New Zealand",
    "lat": -37.6949079,
    "lng": 176.1084939
  },
  {
    "chain": "woolworths",
    "id": "woolworths-birkenhead",
    "name": "Woolworths Birkenhead",
    "address": "Mokoia Road, Birkenhead, Kaipātiki, 0626, New Zealand",
    "lat": -36.8113794,
    "lng": 174.7246297
  },
  {
    "chain": "woolworths",
    "id": "woolworths-9141",
    "name": "Woolworths Botany Downs",
    "address": "Te Irirangi Drive, Golflands, Howick, 2013, New Zealand",
    "lat": -36.9301028,
    "lng": 174.9109314
  },
  {
    "chain": "woolworths",
    "id": "woolworths-9224",
    "name": "Woolworths Browns Bay",
    "address": "Anzac Road, Browns Bay, Hibiscus Coast, 0630, New Zealand",
    "lat": -36.7174547,
    "lng": 174.7472866
  },
  {
    "chain": "woolworths",
    "id": "woolworths-cable-car-lane",
    "name": "Woolworths Cable Car Lane",
    "address": "280/284 Lambton Quay, Wellington, 6011, New Zealand",
    "lat": -41.2843215,
    "lng": 174.7752344
  },
  {
    "chain": "woolworths",
    "id": "woolworths-christchurch-airport",
    "name": "Woolworths Christchurch Airport",
    "address": "Hägglund Antarctic Ride, Christchurch Airport, Christchurch, 8053, New Zealand",
    "lat": -43.4898606,
    "lng": 172.5477102
  },
  {
    "chain": "woolworths",
    "id": "woolworths-christchurch-central",
    "name": "Woolworths Christchurch Central",
    "address": "347 Moorhouse Avenue, Christchurch Central, Christchurch, 8011, New Zealand",
    "lat": -43.5387714,
    "lng": 172.641768
  },
  {
    "chain": "woolworths",
    "id": "woolworths-church-corner",
    "name": "Woolworths Church Corner",
    "address": "361 Riccarton Road, Upper Riccarton, Christchurch, 8041, New Zealand",
    "lat": -43.5327602,
    "lng": 172.5730749
  },
  {
    "chain": "woolworths",
    "id": "woolworths-colombo-street",
    "name": "Woolworths Colombo Street",
    "address": "219 Colombo Street, Christchurch, New Zealand",
    "lat": -43.5533264,
    "lng": 172.6356006
  },
  {
    "chain": "woolworths",
    "id": "woolworths-crofton-downs",
    "name": "Woolworths Crofton Downs",
    "address": "124 Churchill Drive, Wellington, New Zealand",
    "lat": -41.257367,
    "lng": 174.7658627
  },
  {
    "chain": "woolworths",
    "id": "woolworths-dargaville",
    "name": "Woolworths Dargaville",
    "address": "125 Victoria Street, Dargaville, 0310, New Zealand",
    "lat": -35.9399109,
    "lng": 173.8723322
  },
  {
    "chain": "woolworths",
    "id": "woolworths-dinsdale",
    "name": "Woolworths Dinsdale",
    "address": "Jasmine Avenue, Dinsdale, Hamilton City, 3218, New Zealand",
    "lat": -37.7964692,
    "lng": 175.2453271
  },
  {
    "chain": "woolworths",
    "id": "woolworths-dunedin-central",
    "name": "Woolworths Dunedin Central",
    "address": "Cumberland Street, Dunedin Central, Dunedin, 9016, New Zealand",
    "lat": -45.8741793,
    "lng": 170.5063906
  },
  {
    "chain": "woolworths",
    "id": "woolworths-fairy-springs",
    "name": "Woolworths Fairy Springs",
    "address": "Maisey Place, Fairy Springs, Rotorua, 3045, New Zealand",
    "lat": -38.1205317,
    "lng": 176.228087
  },
  {
    "chain": "woolworths",
    "id": "woolworths-feilding",
    "name": "Woolworths Feilding",
    "address": "147 Kimbolton Road, Feilding, 4702, New Zealand",
    "lat": -40.2252395,
    "lng": 175.5685062
  },
  {
    "chain": "woolworths",
    "id": "woolworths-ferrymead",
    "name": "Woolworths Ferrymead",
    "address": "999 Ferry Road, Ferrymead, Christchurch, 8023, New Zealand",
    "lat": -43.5568252,
    "lng": 172.7025138
  },
  {
    "chain": "woolworths",
    "id": "woolworths-flagstaff",
    "name": "Woolworths Flagstaff",
    "address": "3 Fergy Place, Flagstaff, Hamilton City, 3210, New Zealand",
    "lat": -37.7221395,
    "lng": 175.2585983
  },
  {
    "chain": "woolworths",
    "id": "woolworths-flaxmere",
    "name": "Woolworths Flaxmere",
    "address": "Swansea Road, Flaxmere, 4120, New Zealand",
    "lat": -39.6256026,
    "lng": 176.7853098
  },
  {
    "chain": "woolworths",
    "id": "woolworths-franklin-1",
    "name": "Woolworths Franklin",
    "address": "14 Tobin Street, Franklin, 2120, New Zealand",
    "lat": -37.1995668,
    "lng": 174.9022174
  },
  {
    "chain": "woolworths",
    "id": "woolworths-franklin-2",
    "name": "Woolworths Franklin",
    "address": "Svendsen Road, Franklin, 2120, New Zealand",
    "lat": -37.2105899,
    "lng": 174.9120059
  },
  {
    "chain": "woolworths",
    "id": "woolworths-fraser-cove",
    "name": "Woolworths Fraser Cove",
    "address": "229 - 233 Fraser Street, 3112, New Zealand",
    "lat": -37.7135008,
    "lng": 176.1506858
  },
  {
    "chain": "woolworths",
    "id": "woolworths-glen-avon",
    "name": "Woolworths Glen Avon",
    "address": "State Highway 3, Glen Avon, New Plymouth, 4312, New Zealand",
    "lat": -39.0474853,
    "lng": 174.114995
  },
  {
    "chain": "woolworths",
    "id": "woolworths-9163",
    "name": "Woolworths Glenfield",
    "address": "Bentley Avenue, Glenfield, Kaipātiki, 0629, New Zealand",
    "lat": -36.7817287,
    "lng": 174.7228262
  },
  {
    "chain": "woolworths",
    "id": "woolworths-gore",
    "name": "Woolworths Gore",
    "address": "Medway Street, Gore, 9710, New Zealand",
    "lat": -46.0984766,
    "lng": 168.9443098
  },
  {
    "chain": "woolworths",
    "id": "woolworths-greenlane",
    "name": "Woolworths Greenlane",
    "address": "Great South Road, Greenlane, Albert-Eden, 1051, New Zealand",
    "lat": -36.8893202,
    "lng": 174.7936604
  },
  {
    "chain": "woolworths",
    "id": "woolworths-9171",
    "name": "Woolworths Greville Road",
    "address": "65 Greville Road, Pinehill, New Zealand",
    "lat": -36.7317867,
    "lng": 174.720739
  },
  {
    "chain": "woolworths",
    "id": "woolworths-9068",
    "name": "Woolworths Grey Lynn",
    "address": "271 Richmond Road, 1011, New Zealand",
    "lat": -36.8542267,
    "lng": 174.7315432
  },
  {
    "chain": "woolworths",
    "id": "woolworths-greymouth",
    "name": "Woolworths Greymouth",
    "address": "Mackay Street, Greymouth, 7801, New Zealand",
    "lat": -42.4489142,
    "lng": 171.2138794
  },
  {
    "chain": "woolworths",
    "id": "woolworths-halsey-street",
    "name": "Woolworths Halsey Street",
    "address": "Pakenham Street West, City Centre, Auckland, 1001, New Zealand",
    "lat": -36.8437784,
    "lng": 174.757067
  },
  {
    "chain": "woolworths",
    "id": "woolworths-hamilton-central-1",
    "name": "Woolworths Hamilton Central",
    "address": "2 Anzac Parade, Hamilton Central, Hamilton, New Zealand",
    "lat": -37.7937843,
    "lng": 175.2870722
  },
  {
    "chain": "woolworths",
    "id": "woolworths-hamilton-central-2",
    "name": "Woolworths Hamilton Central",
    "address": "20 Anglesea Street, Hamilton Central, Hamilton City, 3204, New Zealand",
    "lat": -37.7823177,
    "lng": 175.2738334
  },
  {
    "chain": "woolworths",
    "id": "woolworths-hamilton-east",
    "name": "Woolworths Hamilton East",
    "address": "160 Peachgrove Road, Hamilton East, Hamilton, 3247, New Zealand",
    "lat": -37.7785145,
    "lng": 175.2992588
  },
  {
    "chain": "woolworths",
    "id": "woolworths-hampstead",
    "name": "Woolworths Hampstead",
    "address": "Tinwald Corridor Cycleway, Hampstead, Ashburton, 7700, New Zealand",
    "lat": -43.909288,
    "lng": 171.7415702
  },
  {
    "chain": "woolworths",
    "id": "woolworths-hastings",
    "name": "Woolworths Hastings",
    "address": "Queen Street West, Saint Leonards, Hastings, 4156, New Zealand",
    "lat": -39.6382709,
    "lng": 176.8420668
  },
  {
    "chain": "woolworths",
    "id": "woolworths-9060",
    "name": "Woolworths Hauraki Corner",
    "address": "373 Lake Road, Hauraki, Devonport-Takapuna, 0622, New Zealand",
    "lat": -36.7967293,
    "lng": 174.7779397
  },
  {
    "chain": "woolworths",
    "id": "woolworths-helensville",
    "name": "Woolworths Helensville",
    "address": "43 Commercial Road, Helensville, 0800, New Zealand",
    "lat": -36.6772404,
    "lng": 174.4511724
  },
  {
    "chain": "woolworths",
    "id": "woolworths-henderson",
    "name": "Woolworths Henderson",
    "address": "Catherine Plaza, Henderson, Auckland, 0612, New Zealand",
    "lat": -36.8804622,
    "lng": 174.6322675
  },
  {
    "chain": "woolworths",
    "id": "woolworths-9249",
    "name": "Woolworths Herne Bay",
    "address": "1 Kelmarna Avenue, Herne Bay, New Zealand",
    "lat": -36.8466143,
    "lng": 174.733446
  },
  {
    "chain": "woolworths",
    "id": "woolworths-highland-park",
    "name": "Woolworths Highland Park",
    "address": "Highland Park Drive, Highland Park, Howick, 2143, New Zealand",
    "lat": -36.8994348,
    "lng": 174.9082305
  },
  {
    "chain": "woolworths",
    "id": "woolworths-9551",
    "name": "Woolworths Hobsonville",
    "address": "124 Hobsonville Road, Hobsonville, Auckland, 0618, New Zealand",
    "lat": -36.7976362,
    "lng": 174.647791
  },
  {
    "chain": "woolworths",
    "id": "woolworths-hornby",
    "name": "Woolworths Hornby",
    "address": "17 Chappie Place, Hornby, Christchurch, 8042, New Zealand",
    "lat": -43.5427645,
    "lng": 172.526909
  },
  {
    "chain": "woolworths",
    "id": "woolworths-howick",
    "name": "Woolworths Howick",
    "address": "35 Cook Street, Howick, Auckland, 2014, New Zealand",
    "lat": -36.8961001,
    "lng": 174.9326181
  },
  {
    "chain": "woolworths",
    "id": "woolworths-huntly",
    "name": "Woolworths Huntly",
    "address": "352 Great South Road, Huntly, 3700, New Zealand",
    "lat": -37.5640641,
    "lng": 175.1587397
  },
  {
    "chain": "woolworths",
    "id": "woolworths-hawera",
    "name": "Woolworths Hāwera",
    "address": "39 Nelson Street, Hāwera, 4610, New Zealand",
    "lat": -39.5876838,
    "lng": 174.2811406
  },
  {
    "chain": "woolworths",
    "id": "woolworths-islington",
    "name": "Woolworths Islington",
    "address": "51 Arthur Street, Islington, Blenheim, 7201, New Zealand",
    "lat": -41.513875,
    "lng": 173.9534971
  },
  {
    "chain": "woolworths",
    "id": "woolworths-johnsonville",
    "name": "Woolworths Johnsonville",
    "address": "65 Johnsonville Road, Johnsonville, Wellington, 6037, New Zealand",
    "lat": -41.2238955,
    "lng": 174.808286
  },
  {
    "chain": "woolworths",
    "id": "woolworths-kaiapoi",
    "name": "Woolworths Kaiapoi",
    "address": "Hilton Street, Kaiapoi, 7630, New Zealand",
    "lat": -43.3859248,
    "lng": 172.6577957
  },
  {
    "chain": "woolworths",
    "id": "woolworths-kaikohe-hokianga-community",
    "name": "Woolworths Kaikohe-Hokianga Community",
    "address": "Station Road, Kaikohe-Hokianga Community, 0405, New Zealand",
    "lat": -35.4103614,
    "lng": 173.7982419
  },
  {
    "chain": "woolworths",
    "id": "woolworths-karori",
    "name": "Woolworths Karori",
    "address": "Karori Road, Karori, Wellington, 6012, New Zealand",
    "lat": -41.2839783,
    "lng": 174.7375584
  },
  {
    "chain": "woolworths",
    "id": "woolworths-katikati",
    "name": "Woolworths Katikati",
    "address": "123/131 Main Road, 3320, New Zealand",
    "lat": -37.560062,
    "lng": 175.9160064
  },
  {
    "chain": "woolworths",
    "id": "woolworths-kelston",
    "name": "Woolworths Kelston",
    "address": "West Coast Road, Kelston, Whau, 0602, New Zealand",
    "lat": -36.9095421,
    "lng": 174.6636616
  },
  {
    "chain": "woolworths",
    "id": "woolworths-kelvin-grove",
    "name": "Woolworths Kelvin Grove",
    "address": "Fernlea Avenue, Kelvin Grove, Palmerston North, 4414, New Zealand",
    "lat": -40.3296308,
    "lng": 175.6531079
  },
  {
    "chain": "woolworths",
    "id": "woolworths-kensington",
    "name": "Woolworths Kensington",
    "address": "Kamo Road, Kensington, Whangārei, 0112, New Zealand",
    "lat": -35.714455,
    "lng": 174.322037
  },
  {
    "chain": "woolworths",
    "id": "woolworths-9502",
    "name": "Woolworths Kerikeri",
    "address": "8 Butler Road, Oakridge, Kerikeri, 0230, New Zealand",
    "lat": -35.2291912,
    "lng": 173.9458475
  },
  {
    "chain": "woolworths",
    "id": "woolworths-kilbirnie",
    "name": "Woolworths Kilbirnie",
    "address": "43 Bay Road, Kilbirnie, Wellington, 6021, New Zealand",
    "lat": -41.3193955,
    "lng": 174.7950216
  },
  {
    "chain": "woolworths",
    "id": "woolworths-lansdowne",
    "name": "Woolworths Lansdowne",
    "address": "Worksop Road, Lansdowne, Masterton District, 5810, New Zealand",
    "lat": -40.9525223,
    "lng": 175.6589096
  },
  {
    "chain": "woolworths",
    "id": "woolworths-leamington",
    "name": "Woolworths Leamington",
    "address": "Cnr Queen & Empire Street, Leamington, Cambridge, 3434, New Zealand",
    "lat": -37.8923161,
    "lng": 175.4706869
  },
  {
    "chain": "woolworths",
    "id": "woolworths-9102",
    "name": "Woolworths Levin",
    "address": "16 Bristol Street, Levin, 5510, New Zealand",
    "lat": -40.6202818,
    "lng": 175.2868264
  },
  {
    "chain": "woolworths",
    "id": "woolworths-9038",
    "name": "Woolworths Lincoln Road",
    "address": "Universal Drive, Te Atatū South, Henderson-Massey, 0610, New Zealand",
    "lat": -36.8572968,
    "lng": 174.6316809
  },
  {
    "chain": "woolworths",
    "id": "woolworths-linwood",
    "name": "Woolworths Linwood",
    "address": "6 Buckleys Road, Linwood, Christchurch, 8062, New Zealand",
    "lat": -43.5324507,
    "lng": 172.6755846
  },
  {
    "chain": "woolworths",
    "id": "woolworths-lower-hutt",
    "name": "Woolworths Lower Hutt",
    "address": "59 Rutherford Street, Lower Hutt Central, Lower Hutt, 5010, New Zealand",
    "lat": -41.2073556,
    "lng": 174.9056894
  },
  {
    "chain": "woolworths",
    "id": "woolworths-9140",
    "name": "Woolworths Lynfield",
    "address": "570 Hillsborough Road, Lynfield, New Zealand",
    "lat": -36.9253724,
    "lng": 174.7229681
  },
  {
    "chain": "woolworths",
    "id": "woolworths-lynnmall",
    "name": "Woolworths Lynnmall",
    "address": "Great North Road, New Lynn, Whau, 0600, New Zealand",
    "lat": -36.907299,
    "lng": 174.684385
  },
  {
    "chain": "woolworths",
    "id": "woolworths-9248",
    "name": "Woolworths Mairangi Bay",
    "address": "Hastings Road, Mairangi Bay, Hibiscus Coast, 0732, New Zealand",
    "lat": -36.7393795,
    "lng": 174.7528072
  },
  {
    "chain": "woolworths",
    "id": "woolworths-manukau",
    "name": "Woolworths Manukau",
    "address": "1 Leyton Way, Manukau, Ōtara-Papatoetoe, 2104, New Zealand",
    "lat": -36.9919145,
    "lng": 174.8826498
  },
  {
    "chain": "woolworths",
    "id": "woolworths-manurewa",
    "name": "Woolworths Manurewa",
    "address": "Browns Road, Wiri, Manurewa, 2242, New Zealand",
    "lat": -37.017468,
    "lng": 174.8639672
  },
  {
    "chain": "woolworths",
    "id": "woolworths-9120",
    "name": "Woolworths Matamata",
    "address": "Gouk Street, Matamata, 3400, New Zealand",
    "lat": -37.8091095,
    "lng": 175.7743064
  },
  {
    "chain": "woolworths",
    "id": "woolworths-meadowbank",
    "name": "Woolworths Meadowbank",
    "address": "Rosepark Crescent, Meadowbank, Ōrākei, 1972, New Zealand",
    "lat": -36.8763662,
    "lng": 174.8283777
  },
  {
    "chain": "woolworths",
    "id": "woolworths-meadowlands",
    "name": "Woolworths Meadowlands",
    "address": "112 Whitford Road, Somerville, Auckland, 2014, New Zealand",
    "lat": -36.9134977,
    "lng": 174.9288338
  },
  {
    "chain": "woolworths",
    "id": "woolworths-milford",
    "name": "Woolworths Milford",
    "address": "Milford Road, Milford, Devonport-Takapuna, 0620, New Zealand",
    "lat": -36.7721827,
    "lng": 174.7662684
  },
  {
    "chain": "woolworths",
    "id": "woolworths-morningside",
    "name": "Woolworths Morningside",
    "address": "Saint Lukes Road, Morningside, Albert-Eden, 1025, New Zealand",
    "lat": -36.8833301,
    "lng": 174.7346411
  },
  {
    "chain": "woolworths",
    "id": "woolworths-mornington",
    "name": "Woolworths Mornington",
    "address": "Meadow Street, Mornington, Dunedin, 9016, New Zealand",
    "lat": -45.8807166,
    "lng": 170.4799932
  },
  {
    "chain": "woolworths",
    "id": "woolworths-morrinsville",
    "name": "Woolworths Morrinsville",
    "address": "76 Studholme Street, Morrinsville, 3300, New Zealand",
    "lat": -37.6568351,
    "lng": 175.5274418
  },
  {
    "chain": "woolworths",
    "id": "woolworths-mosgiel",
    "name": "Woolworths Mosgiel",
    "address": "Church Street, Mosgiel, 9024, New Zealand",
    "lat": -45.8802,
    "lng": 170.3523682
  },
  {
    "chain": "woolworths",
    "id": "woolworths-motueka",
    "name": "Woolworths Motueka",
    "address": "108 High Street, Motueka, 7120, New Zealand",
    "lat": -41.1097089,
    "lng": 173.0108032
  },
  {
    "chain": "woolworths",
    "id": "woolworths-9235",
    "name": "Woolworths Mount Eden",
    "address": "Ewington Avenue, Mount Eden, Auckland, 1024, New Zealand",
    "lat": -36.8774717,
    "lng": 174.7519522
  },
  {
    "chain": "woolworths",
    "id": "woolworths-mount-roskill",
    "name": "Woolworths Mount Roskill",
    "address": "Stoddard Road, Wesley, Puketāpapa, 1041, New Zealand",
    "lat": -36.9040942,
    "lng": 174.726878
  },
  {
    "chain": "woolworths",
    "id": "woolworths-mt-wellington",
    "name": "Woolworths Mt Wellington",
    "address": "Wilson Way, Mount Wellington, Maungakiekie-Tāmaki, 1060, New Zealand",
    "lat": -36.9094509,
    "lng": 174.8372407
  },
  {
    "chain": "woolworths",
    "id": "woolworths-mangere-east",
    "name": "Woolworths Māngere East",
    "address": "2 Growers Lane, Māngere East, Māngere-Ōtāhuhu, 2153, New Zealand",
    "lat": -36.9657744,
    "lng": 174.8240973
  },
  {
    "chain": "woolworths",
    "id": "woolworths-mangere-town-centre",
    "name": "Woolworths Māngere Town Centre",
    "address": "2/29 Mangere Town Square, Māngere, Māngere-Ōtāhuhu, 2153, New Zealand",
    "lat": -36.9703691,
    "lng": 174.8007359
  },
  {
    "chain": "woolworths",
    "id": "woolworths-mangere-otahuhu",
    "name": "Woolworths Māngere-Ōtāhuhu",
    "address": "John Goulter Drive, Māngere-Ōtāhuhu, 2022, New Zealand",
    "lat": -36.9974963,
    "lng": 174.7890291
  },
  {
    "chain": "woolworths",
    "id": "woolworths-napier-south",
    "name": "Woolworths Napier South",
    "address": "36 Carlyle Street, Napier South, Napier, 4110, New Zealand",
    "lat": -39.492734,
    "lng": 176.9113899
  },
  {
    "chain": "woolworths",
    "id": "woolworths-new-brighton",
    "name": "Woolworths New Brighton",
    "address": "12 Hawke Street, New Brighton, Christchurch, 8061, New Zealand",
    "lat": -43.5068158,
    "lng": 172.729992
  },
  {
    "chain": "woolworths",
    "id": "woolworths-newmarket",
    "name": "Woolworths Newmarket",
    "address": "Mortimer Pass, Newmarket, Auckland, 1052, New Zealand",
    "lat": -36.8707867,
    "lng": 174.7751969
  },
  {
    "chain": "woolworths",
    "id": "woolworths-newtown",
    "name": "Woolworths Newtown",
    "address": "3 John Street, New Zealand",
    "lat": -41.3075167,
    "lng": 174.7773064
  },
  {
    "chain": "woolworths",
    "id": "woolworths-northcote",
    "name": "Woolworths Northcote",
    "address": "123 Lake Road, Northcote, Kaipātiki, 0627, New Zealand",
    "lat": -36.8002159,
    "lng": 174.7449785
  },
  {
    "chain": "woolworths",
    "id": "woolworths-northlands",
    "name": "Woolworths Northlands",
    "address": "85 Main North Road, Christchurch, 8052, New Zealand",
    "lat": -43.4914641,
    "lng": 172.6117487
  },
  {
    "chain": "woolworths",
    "id": "woolworths-northwest",
    "name": "Woolworths Northwest",
    "address": "Fred Taylor Drive, Westgate, Henderson-Massey, 0814, New Zealand",
    "lat": -36.8187035,
    "lng": 174.6121372
  },
  {
    "chain": "woolworths",
    "id": "woolworths-onehunga",
    "name": "Woolworths Onehunga",
    "address": "Waiapu Lane, Onehunga, Maungakiekie-Tāmaki, 1061, New Zealand",
    "lat": -36.9226323,
    "lng": 174.7834399
  },
  {
    "chain": "woolworths",
    "id": "woolworths-9430",
    "name": "Woolworths Otorohanga",
    "address": "123 Maniapoto Street, Ōtorohanga, 3900, New Zealand",
    "lat": -38.190033,
    "lng": 175.2099645
  },
  {
    "chain": "woolworths",
    "id": "woolworths-otumoetai",
    "name": "Woolworths Otūmoetai",
    "address": "Bureta Road, Otūmoetai, Tauranga, 3110, New Zealand",
    "lat": -37.6687738,
    "lng": 176.1540215
  },
  {
    "chain": "woolworths",
    "id": "woolworths-paeroa",
    "name": "Woolworths Paeroa",
    "address": "William Street, Paeroa, 3600, New Zealand",
    "lat": -37.3783542,
    "lng": 175.6680489
  },
  {
    "chain": "woolworths",
    "id": "woolworths-9204",
    "name": "Woolworths Pakuranga",
    "address": "Pepler Street, Pakuranga, Howick, 2010, New Zealand",
    "lat": -36.9129873,
    "lng": 174.8709888
  },
  {
    "chain": "woolworths",
    "id": "woolworths-palmerston-north-central-1",
    "name": "Woolworths Palmerston North Central",
    "address": "Ashley Street, Palmerston North Central, Palmerston North, 4410, New Zealand",
    "lat": -40.3578057,
    "lng": 175.6151052
  },
  {
    "chain": "woolworths",
    "id": "woolworths-palmerston-north-central-2",
    "name": "Woolworths Palmerston North Central",
    "address": "Featherston Street Cycleway, Palmerston North Central, Palmerston North, 4410, New Zealand",
    "lat": -40.3508291,
    "lng": 175.6055437
  },
  {
    "chain": "woolworths",
    "id": "woolworths-papaioea",
    "name": "Woolworths Papaioea",
    "address": "673 Main Street, Papaioea, Palmerston North, 4414, New Zealand",
    "lat": -40.3502898,
    "lng": 175.6232818
  },
  {
    "chain": "woolworths",
    "id": "woolworths-papakura",
    "name": "Woolworths Papakura",
    "address": "Railway Street West, Papakura, 2110, New Zealand",
    "lat": -37.06428,
    "lng": 174.9447004
  },
  {
    "chain": "woolworths",
    "id": "woolworths-papakowhai",
    "name": "Woolworths Papakōwhai",
    "address": "3 Whitford Brown Avenue, Papakōwhai, Porirua, 5024, New Zealand",
    "lat": -41.1207736,
    "lng": 174.8669722
  },
  {
    "chain": "woolworths",
    "id": "woolworths-papamoa",
    "name": "Woolworths Papamoa",
    "address": "Domain Shared Path, Papamoa, 3118, New Zealand",
    "lat": -37.699073,
    "lng": 176.2837376
  },
  {
    "chain": "woolworths",
    "id": "woolworths-papatoetoe",
    "name": "Woolworths Papatoetoe",
    "address": "Great South Road, Papatoetoe, Ōtara-Papatoetoe, 2025, New Zealand",
    "lat": -36.9706896,
    "lng": 174.8606725
  },
  {
    "chain": "woolworths",
    "id": "woolworths-paraparaumu",
    "name": "Woolworths Paraparaumu",
    "address": "Coastlands Parade, Paraparaumu, 5032, New Zealand",
    "lat": -40.917087,
    "lng": 175.0050929
  },
  {
    "chain": "woolworths",
    "id": "woolworths-petone",
    "name": "Woolworths Petone",
    "address": "Hutt Road, Petone, Lower Hutt, 5012, New Zealand",
    "lat": -41.222261,
    "lng": 174.8725799
  },
  {
    "chain": "woolworths",
    "id": "woolworths-pioneer-highway",
    "name": "Woolworths Pioneer Highway",
    "address": "Rugby Street, Awapuni, Palmerston North, 4412, New Zealand",
    "lat": -40.3709432,
    "lng": 175.5810257
  },
  {
    "chain": "woolworths",
    "id": "woolworths-point-chevalier",
    "name": "Woolworths Point Chevalier",
    "address": "Point Chevalier Arcade, Point Chevalier, Albert-Eden, 1022, New Zealand",
    "lat": -36.8697638,
    "lng": 174.7102258
  },
  {
    "chain": "woolworths",
    "id": "woolworths-9057",
    "name": "Woolworths Ponsonby",
    "address": "4 Williamson Avenue, New Zealand",
    "lat": -36.8583854,
    "lng": 174.7489731
  },
  {
    "chain": "woolworths",
    "id": "woolworths-porirua-city-centre",
    "name": "Woolworths Porirua City Centre",
    "address": "Jellicoe Street, Porirua City Centre, Porirua, 5240, New Zealand",
    "lat": -41.1333305,
    "lng": 174.8412318
  },
  {
    "chain": "woolworths",
    "id": "woolworths-pukete",
    "name": "Woolworths Pukete",
    "address": "8 Eagle Way, Pukete, Hamilton, 3200, New Zealand",
    "lat": -37.7462999,
    "lng": 175.2344789
  },
  {
    "chain": "woolworths",
    "id": "woolworths-9095",
    "name": "Woolworths Putaruru",
    "address": "11 MacKenzie Street, Putāruru, 3411, New Zealand",
    "lat": -38.046909,
    "lng": 175.7804466
  },
  {
    "chain": "woolworths",
    "id": "woolworths-pokeno",
    "name": "Woolworths Pōkeno",
    "address": "58 Great South Road, Pōkeno, New Zealand",
    "lat": -37.2450369,
    "lng": 175.0227724
  },
  {
    "chain": "woolworths",
    "id": "woolworths-queensgate",
    "name": "Woolworths Queensgate",
    "address": "Knights Road, Lower Hutt Central, Lower Hutt, 5010, New Zealand",
    "lat": -41.2107306,
    "lng": 174.9075343
  },
  {
    "chain": "woolworths",
    "id": "woolworths-queenstown",
    "name": "Woolworths Queenstown",
    "address": "30 Grant Road, Frankton, Queenstown, New Zealand",
    "lat": -45.0136555,
    "lng": 168.742117
  },
  {
    "chain": "woolworths",
    "id": "woolworths-queenwood",
    "name": "Woolworths Queenwood",
    "address": "Lynden Court, Queenwood, Hamilton City, 3210, New Zealand",
    "lat": -37.7499566,
    "lng": 175.278114
  },
  {
    "chain": "woolworths",
    "id": "woolworths-rangatira-park",
    "name": "Woolworths Rangatira Park",
    "address": "20 Spa Road, Rangatira Park, Taupō, 3377, New Zealand",
    "lat": -38.6838538,
    "lng": 176.0709758
  },
  {
    "chain": "woolworths",
    "id": "woolworths-rangiora",
    "name": "Woolworths Rangiora",
    "address": "Ivory Gardens, Rangiora, 7400, New Zealand",
    "lat": -43.3073825,
    "lng": 172.5988696
  },
  {
    "chain": "woolworths",
    "id": "woolworths-redwoodtown",
    "name": "Woolworths Redwoodtown",
    "address": "94 Alabama Road, Redwoodtown, Blenheim, 7301, New Zealand",
    "lat": -41.528695,
    "lng": 173.9553815
  },
  {
    "chain": "woolworths",
    "id": "woolworths-richmond",
    "name": "Woolworths Richmond",
    "address": "Esk Street, Richmond, Invercargill City, 9810, New Zealand",
    "lat": -46.4122328,
    "lng": 168.3581913
  },
  {
    "chain": "woolworths",
    "id": "woolworths-9040",
    "name": "Woolworths Richmond",
    "address": "144 Salisbury Road, Richmond, 7020, New Zealand",
    "lat": -41.3347816,
    "lng": 173.202632
  },
  {
    "chain": "woolworths",
    "id": "woolworths-richmond-heights",
    "name": "Woolworths Richmond Heights",
    "address": "16 Kokomea Village Drive, Richmond Heights, Taupō, 3378, New Zealand",
    "lat": -38.7223608,
    "lng": 176.0807391
  },
  {
    "chain": "woolworths",
    "id": "woolworths-rodney",
    "name": "Woolworths Rodney",
    "address": "20-26 Neville Street, Rodney, 0910, New Zealand",
    "lat": -36.3994756,
    "lng": 174.6639769
  },
  {
    "chain": "woolworths",
    "id": "woolworths-rolleston",
    "name": "Woolworths Rolleston",
    "address": "59 Rolleston Drive, Rolleston, 7643, New Zealand",
    "lat": -43.5941567,
    "lng": 172.3866405
  },
  {
    "chain": "woolworths",
    "id": "woolworths-roselands-mall",
    "name": "Woolworths Roselands Mall",
    "address": "90-92 Great South Road, Papakura, 2110, New Zealand",
    "lat": -37.0589556,
    "lng": 174.9411784
  },
  {
    "chain": "woolworths",
    "id": "woolworths-9189",
    "name": "Woolworths Rotorua",
    "address": "246 Fenton Street, Rotorua, New Zealand",
    "lat": -38.1432402,
    "lng": 176.2553549
  },
  {
    "chain": "woolworths",
    "id": "woolworths-rototuna",
    "name": "Woolworths Rototuna",
    "address": "Rototuna Road, Rototuna, Hamilton City, 3210, New Zealand",
    "lat": -37.7324564,
    "lng": 175.2730566
  },
  {
    "chain": "woolworths",
    "id": "woolworths-saint-johns",
    "name": "Woolworths Saint Johns",
    "address": "Te Ara ki Uta ki Tai / The Path of Land and Sea, Saint Johns, Ōrākei, 1072, New Zealand",
    "lat": -36.8795037,
    "lng": 174.852199
  },
  {
    "chain": "woolworths",
    "id": "woolworths-saint-johns-hill",
    "name": "Woolworths Saint Johns Hill",
    "address": "Victoria Avenue, Saint Johns Hill, Whanganui, 4500, New Zealand",
    "lat": -39.925468,
    "lng": 175.0381641
  },
  {
    "chain": "woolworths",
    "id": "woolworths-silverdale",
    "name": "Woolworths Silverdale",
    "address": "Weir Lane, Silverdale, Hibiscus Coast, 0944, New Zealand",
    "lat": -36.6140006,
    "lng": 174.6810754
  },
  {
    "chain": "woolworths",
    "id": "woolworths-south-dunedin",
    "name": "Woolworths South Dunedin",
    "address": "560 Andersons Bay Road, South Dunedin, Dunedin, 9012, New Zealand",
    "lat": -45.8964341,
    "lng": 170.5088827
  },
  {
    "chain": "woolworths",
    "id": "woolworths-south-hill",
    "name": "Woolworths South Hill",
    "address": "14 Coquet Street, South Hill, Ōamaru, 9444, New Zealand",
    "lat": -45.0971799,
    "lng": 170.9705024
  },
  {
    "chain": "woolworths",
    "id": "woolworths-spotswood",
    "name": "Woolworths Spotswood",
    "address": "2 Manadon Street, New Plymouth, 4310, New Zealand",
    "lat": -39.075036,
    "lng": 174.0330487
  },
  {
    "chain": "woolworths",
    "id": "woolworths-springlands",
    "name": "Woolworths Springlands",
    "address": "Middle Renwick Road, Springlands, Blenheim, 7201, New Zealand",
    "lat": -41.5097836,
    "lng": 173.9351468
  },
  {
    "chain": "woolworths",
    "id": "woolworths-stoke",
    "name": "Woolworths Stoke",
    "address": "498 Main Road Stoke, Stoke, Nelson City, 7011, New Zealand",
    "lat": -41.3118578,
    "lng": 173.2345732
  },
  {
    "chain": "woolworths",
    "id": "woolworths-strandon",
    "name": "Woolworths Strandon",
    "address": "174 Courtenay Street, Strandon, New Plymouth, 4310, New Zealand",
    "lat": -39.0568052,
    "lng": 174.082291
  },
  {
    "chain": "woolworths",
    "id": "woolworths-stratford",
    "name": "Woolworths Stratford",
    "address": "Broadway, Stratford, 4332, New Zealand",
    "lat": -39.3273137,
    "lng": 174.2793688
  },
  {
    "chain": "woolworths",
    "id": "woolworths-9197",
    "name": "Woolworths Sunnynook",
    "address": "15/120 Sunnynook Road, New Zealand",
    "lat": -36.7590991,
    "lng": 174.7397275
  },
  {
    "chain": "woolworths",
    "id": "woolworths-9202",
    "name": "Woolworths Takanini",
    "address": "1/226 Great South Road, Takanini, Papakura, 2112, New Zealand",
    "lat": -37.0475385,
    "lng": 174.9271746
  },
  {
    "chain": "woolworths",
    "id": "woolworths-9237",
    "name": "Woolworths Takapuna",
    "address": "2 Barrys Point Road, Takapuna, New Zealand",
    "lat": -36.7915398,
    "lng": 174.765533
  },
  {
    "chain": "woolworths",
    "id": "woolworths-9162",
    "name": "Woolworths Tauranga",
    "address": "618 Cameron Road, Tauranga South, Tauranga, 3112, New Zealand",
    "lat": -37.7010903,
    "lng": 176.1580352
  },
  {
    "chain": "woolworths",
    "id": "woolworths-tawa",
    "name": "Woolworths Tawa",
    "address": "William Earp Place, Horokiwi, Wellington, 5028, New Zealand",
    "lat": -41.1866491,
    "lng": 174.8311661
  },
  {
    "chain": "woolworths",
    "id": "woolworths-te-aroha",
    "name": "Woolworths Te Aroha",
    "address": "91 Whitaker Street, Te Aroha, 3320, New Zealand",
    "lat": -37.5450931,
    "lng": 175.7138119
  },
  {
    "chain": "woolworths",
    "id": "woolworths-te-atatu-south",
    "name": "Woolworths Te Atatu South",
    "address": "Edmonton Road, Te Atatū South, Henderson-Massey, 0610, New Zealand",
    "lat": -36.8656581,
    "lng": 174.6463099
  },
  {
    "chain": "woolworths",
    "id": "woolworths-te-awamutu",
    "name": "Woolworths Te Awamutu",
    "address": "180 Sloane Street, 3800, New Zealand",
    "lat": -38.0119422,
    "lng": 175.3270146
  },
  {
    "chain": "woolworths",
    "id": "woolworths-te-puke",
    "name": "Woolworths Te Puke",
    "address": "8 Boucher Avenue, Te Puke, New Zealand",
    "lat": -37.7846271,
    "lng": 176.3252728
  },
  {
    "chain": "woolworths",
    "id": "woolworths-the-palms",
    "name": "Woolworths The Palms",
    "address": "Marshland Road, Shirley, Christchurch, 8061, New Zealand",
    "lat": -43.5054501,
    "lng": 172.6643767
  },
  {
    "chain": "woolworths",
    "id": "woolworths-the-wood",
    "name": "Woolworths The Wood",
    "address": "Paru Paru Road, The Wood, Nelson, 7040, New Zealand",
    "lat": -41.2701662,
    "lng": 173.2816098
  },
  {
    "chain": "woolworths",
    "id": "woolworths-three-kings",
    "name": "Woolworths Three Kings",
    "address": "532 Mount Albert Road, 1042, New Zealand",
    "lat": -36.9080089,
    "lng": 174.7556524
  },
  {
    "chain": "woolworths",
    "id": "woolworths-tikipunga",
    "name": "Woolworths Tikipunga",
    "address": "Papa Totara Loop, Tikipunga, Whangārei, 0112, New Zealand",
    "lat": -35.6833989,
    "lng": 174.3208346
  },
  {
    "chain": "woolworths",
    "id": "woolworths-timaru",
    "name": "Woolworths Timaru",
    "address": "9 Browne Street, 7910, New Zealand",
    "lat": -44.4023035,
    "lng": 171.2546092
  },
  {
    "chain": "woolworths",
    "id": "woolworths-timaru-north",
    "name": "Woolworths Timaru North",
    "address": "233 Evans Street, Timaru, 7910, New Zealand",
    "lat": -44.3724973,
    "lng": 171.242298
  },
  {
    "chain": "woolworths",
    "id": "woolworths-tokoroa",
    "name": "Woolworths Tokoroa",
    "address": "Torphin Crescent, Tokoroa, 3420, New Zealand",
    "lat": -38.222475,
    "lng": 175.8733997
  },
  {
    "chain": "woolworths",
    "id": "woolworths-trafalgar-square",
    "name": "Woolworths Trafalgar Square",
    "address": "Te Tuaiwi Cycleway, Putiki, Whanganui, 4500, New Zealand",
    "lat": -39.9356308,
    "lng": 175.0532157
  },
  {
    "chain": "woolworths",
    "id": "woolworths-tahunanui",
    "name": "Woolworths Tāhunanui",
    "address": "Cadillac Way, Tāhunanui, Nelson City, 7011, New Zealand",
    "lat": -41.2986085,
    "lng": 173.2410114
  },
  {
    "chain": "woolworths",
    "id": "woolworths-upper-hutt",
    "name": "Woolworths Upper Hutt",
    "address": "29 Savage Crescent, Upper Hutt Central, Upper Hutt, 5218, New Zealand",
    "lat": -41.1226078,
    "lng": 175.0712593
  },
  {
    "chain": "woolworths",
    "id": "woolworths-vincent-community",
    "name": "Woolworths Vincent Community",
    "address": "Ventry Street, Vincent Community, 9320, New Zealand",
    "lat": -45.24952,
    "lng": 169.3848595
  },
  {
    "chain": "woolworths",
    "id": "woolworths-vogeltown",
    "name": "Woolworths Vogeltown",
    "address": "30 Hori Street, Vogeltown, New Plymouth, New Zealand",
    "lat": -39.0786141,
    "lng": 174.0832836
  },
  {
    "chain": "woolworths",
    "id": "woolworths-9464",
    "name": "Woolworths Waiata Shores",
    "address": "8/2 Periko Way, Takanini, Papakura, 2112, New Zealand",
    "lat": -37.035672,
    "lng": 174.9081424
  },
  {
    "chain": "woolworths",
    "id": "woolworths-9030",
    "name": "Woolworths Waiheke Island",
    "address": "Belgium Street, Waiheke, 1081, New Zealand",
    "lat": -36.7960548,
    "lng": 175.045914
  },
  {
    "chain": "woolworths",
    "id": "woolworths-waikanae",
    "name": "Woolworths Waikanae",
    "address": "Ngaio Road, Waikanae, 5036, New Zealand",
    "lat": -40.8761435,
    "lng": 175.0650414
  },
  {
    "chain": "woolworths",
    "id": "woolworths-waikiwi",
    "name": "Woolworths Waikiwi",
    "address": "Durham Street, Waikiwi, Invercargill City, 9843, New Zealand",
    "lat": -46.3748497,
    "lng": 168.3463079
  },
  {
    "chain": "woolworths",
    "id": "woolworths-waimakariri-junction",
    "name": "Woolworths Waimakariri Junction",
    "address": "6 Hakarau Road, Kaiapoi, 7630, New Zealand",
    "lat": -43.3763835,
    "lng": 172.649449
  },
  {
    "chain": "woolworths",
    "id": "woolworths-wainuiomata",
    "name": "Woolworths Wainuiomata",
    "address": "12/18 The Strand, Wainuiomata, Lower Hutt, 5014, New Zealand",
    "lat": -41.2607572,
    "lng": 174.9445936
  },
  {
    "chain": "woolworths",
    "id": "woolworths-waipukurau",
    "name": "Woolworths Waipukurau",
    "address": "16 Ruataniwha Street, Waipukurau, 4200, New Zealand",
    "lat": -39.9954411,
    "lng": 176.557705
  },
  {
    "chain": "woolworths",
    "id": "woolworths-washington-valley",
    "name": "Woolworths Washington Valley",
    "address": "35 Saint Vincent Street, Washington Valley, Nelson, 7010, New Zealand",
    "lat": -41.2729121,
    "lng": 173.2775514
  },
  {
    "chain": "woolworths",
    "id": "woolworths-westgate",
    "name": "Woolworths Westgate",
    "address": "5 Maki Street, Westgate, Henderson-Massey, 0814, New Zealand",
    "lat": -36.8214066,
    "lng": 174.6143437
  },
  {
    "chain": "woolworths",
    "id": "woolworths-whakatane-central",
    "name": "Woolworths Whakatāne Central",
    "address": "119 Commerce Street, Whakatāne Central, Whakatāne, 3158, New Zealand",
    "lat": -37.9568123,
    "lng": 176.9948335
  },
  {
    "chain": "woolworths",
    "id": "woolworths-whangaparaoa",
    "name": "Woolworths Whangaparaoa",
    "address": "713 Whangaparaoa Road, 0930, New Zealand",
    "lat": -36.6362752,
    "lng": 174.7461255
  },
  {
    "chain": "woolworths",
    "id": "woolworths-9195",
    "name": "Woolworths Whangarei",
    "address": "5 Okara Drive, Vinetown, Whangārei, 0101, New Zealand",
    "lat": -35.730479,
    "lng": 174.3273604
  },
  {
    "chain": "woolworths",
    "id": "woolworths-whataupoko",
    "name": "Woolworths Whataupoko",
    "address": "Eden Lane, Whataupoko, Gisborne, 4010, New Zealand",
    "lat": -38.6612549,
    "lng": 178.0170791
  },
  {
    "chain": "woolworths",
    "id": "woolworths-whitianga",
    "name": "Woolworths Whitianga",
    "address": "Joan Gaskell Drive, Whitianga, 3510, New Zealand",
    "lat": -36.8341553,
    "lng": 175.6949828
  },
  {
    "chain": "woolworths",
    "id": "woolworths-orewa",
    "name": "Woolworths Ōrewa",
    "address": "5-11 Moenui Avenue, Ōrewa, 0931, New Zealand",
    "lat": -36.5883197,
    "lng": 174.6950561
  },
  {
    "chain": "woolworths",
    "id": "woolworths-otaki-town",
    "name": "Woolworths Ōtaki Town",
    "address": "Mill Road, Ōtaki Town, Ōtaki, 5512, New Zealand",
    "lat": -40.7534934,
    "lng": 175.1408675
  }
];
