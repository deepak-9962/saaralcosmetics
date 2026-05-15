import type { Product } from "./types";

// Mock products for initial development — replace with Supabase queries later
export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-001",
    name: "Saffron Radiance Elixir",
    slug: "saffron-radiance-elixir",
    category: "face-cream",
    variant_name: "50g",
    price: 48,
    compare_price: null,
    description:
      "A precious blend of pure saffron, lotus extracts, and rare botanical oils. This traditional apothecary formulation works overnight to restore youthful radiance, deeply nourish, and refine skin texture.",
    ingredients:
      "Saffron Extract, Rose Water, Sandalwood Oil, Almond Oil, Sesame Oil, Vetiver Extract. 100% natural and organically sourced.",
    how_to_use:
      "After cleansing, warm 3-4 drops between your palms. Gently press into the face and neck using upward strokes. Breathe deeply to enjoy the calming botanical aroma.",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAOGWrnxkgymoK18Tfv6G_l2IcSz3iEBB_MKVAK1Dk4YCuFfEYGVKOPLiPYzlg0m5LN9HffYHVUPDK2lQn30eqd4irlOTeIjXzV7Kn0kWfhIU4hX2evzmaE7fX87Rulsiwk9LuLnj2Z9DDZDWOYddzOlQfegNeFKulbSnHTDkHzIJHo1gWQcdPLW-RfwMvy3m6_baXLbkjimFBDni5SqhkRkot0GCdgM8XfhkIshTYOrL6BlS8zzGHZMJSkKFA7YbI1o5VK94-g_wnA",
    ],
    stock: 50,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "prod-002",
    name: "Neem & Tulsi Wash",
    slug: "neem-tulsi-wash",
    category: "face-wash",
    variant_name: "120ml",
    price: 32,
    compare_price: null,
    description:
      "A purifying gel cleanser infused with organic neem and tulsi extracts. Gently removes impurities while maintaining your skin's natural moisture balance.",
    ingredients:
      "Neem Extract, Tulsi (Holy Basil) Leaf Extract, Aloe Vera Gel, Green Tea Extract, Glycerin.",
    how_to_use:
      "Apply a small amount to damp skin. Massage gently in circular motions, then rinse thoroughly with water. Use morning and evening.",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB8UOt06vmVuZYFYgggt_kr__xOophPqb9ZRREpUfHXIYpwpI0gbBAP-okieSuR3LDk2KU02vVFUYpMyyW6zuULJj_s9o1g_2pVZop5GJ4QIV-g6uqjgcM3ygJ3ChLBDANGm6ekiFpA8EhBe3UvFeMZIHyeE6jycpO_9PSOerw3fh9N4jyY0feTp4JGA-G_cshW6PmuFQRIDE8UM5i5wR06JA8P77M29Ci09rww0U87s2FPolEXpL2RAca8rGxvrbkbe4RbjKYczpYP",
    ],
    stock: 75,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "prod-003",
    name: "Turmeric Glow Bar",
    slug: "turmeric-glow-bar",
    category: "soap",
    variant_name: "100g",
    price: 24,
    compare_price: null,
    description:
      "A beautifully textured artisanal soap bar featuring embedded botanicals. Handcrafted with organic turmeric and sandalwood for a luxurious bathing experience.",
    ingredients:
      "Organic Turmeric, Sandalwood Powder, Coconut Oil, Olive Oil, Shea Butter, Essential Oils.",
    how_to_use:
      "Lather between wet hands or on a washcloth. Apply to body in gentle circular motions. Rinse well. For face, create a light lather and apply gently.",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDLrE4jpKirjO7JGvB37nbPxdNg9uRoRQwAP2wtT1x2C7UZt0peBaxoY_UZQMw-VcKrWIE6p9VO-6MU6-CgVUBeg6gbeeLrz8edP50CZV3N0QPmm6joOpGg1aBCiKHaQMx5JcKeYpDHU2FhzJYHxM-M5yX9XQePa7DOTfA2PJrRy5xNgY3PfONNZuaD5iko7vT1khApohmF3JPcniLKhy4Vn0jdVWk-OVwbw3yNg8gutG67x30Nwd6oU9p42r7StADsMtd1rpEhUQB0",
    ],
    stock: 100,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "prod-004",
    name: "Radiance Renewal Cream",
    slug: "radiance-renewal-cream",
    category: "face-cream",
    variant_name: "50g",
    price: 48,
    compare_price: null,
    description:
      "An illuminating face cream enriched with kumkumadi oil and natural botanicals. Reveals your skin's inner glow with daily use.",
    ingredients:
      "Kumkumadi Oil, Saffron, Rose Water, Almond Oil, Vitamin E, Hyaluronic Acid.",
    how_to_use:
      "Apply a small amount to clean, dry skin. Gently massage in upward motions until fully absorbed. Use morning and night.",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCparvuyiKD7NmHDSpowXLVOtkSAh3B-QW5GN_Dhyf_Ehimon6Y5W79MmzA6WbGFeWQC4Afe3kSzGJ79erp0i43afG-Fov_TlkiSL0-HpigekV2R5Tl4h1qUTcgmHwGX4o38cCE3R3Ab1QfHzyBDIcUeXPRiOdap-HkG9drWp7q3EBvoOMter6I1oVL84ONm_9g8bgh0xUr1G7A-7t1eKDN-0N07-H-uYDVi5ZvLVAm6n5UpDCFkINPuMBRW5rSdex2csfzEEHVi1ep",
    ],
    stock: 40,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "prod-005",
    name: "Purifying Botanical Wash",
    slug: "purifying-botanical-wash",
    category: "face-wash",
    variant_name: "120ml",
    price: 32,
    compare_price: null,
    description:
      "An elegant botanical face wash that draws from ancient apothecary wisdom. Purifies deeply while maintaining your skin's delicate moisture balance.",
    ingredients:
      "Neem Extract, Tea Tree Oil, Cucumber Extract, Chamomile, Witch Hazel, Glycerin.",
    how_to_use:
      "Wet face with lukewarm water. Apply a small amount and massage gently. Rinse thoroughly. Pat dry with a soft towel.",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBNww2FDNfd42ab0cIP9EVntKjuYRT6XripQospmnb-UMpBt8pkWvn_mrS096Bi_s296Hp_tMth2ncvB3groT3WAbYxbDryjk4M6yTE8l-IgYguZUi9Z1hEUBU9h-pm1GUT1_EdV0Rh6I38QITbu2mGll3g6OCYqGPmVi80E33txuQlwmrpgFpfs00NiFrHXAEZ7akSMAbR65ukaFBaZIi4uVsjo7BSQd4VsMmAhllcvYm_iimvoPwptCuBTARcGgAr2P4W0c65VhxJ",
    ],
    stock: 60,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "prod-006",
    name: "Turmeric & Sandalwood Soap",
    slug: "turmeric-sandalwood-soap",
    category: "soap",
    variant_name: "100g",
    price: 18,
    compare_price: null,
    description:
      "A rustic, artisan soap bar featuring embedded botanicals. Handcrafted using traditional cold-process methods for the ultimate skin nourishment.",
    ingredients:
      "Turmeric, Sandalwood, Coconut Oil, Castor Oil, Lye, Essential Oil Blend.",
    how_to_use:
      "Lather between wet hands. Apply to body or face gently. Rinse well with water. Store in a well-drained soap dish between uses.",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBkyDKdv3DtWUF2YmrfLMN33-DUovaaoSXl60ca8RrAqZwvQOOHKf5IDOdaSmapy6TDVtjF3ni4c1YXQnMfvp-EZDaI2yrKubxLSdhfVmiJwfHWocZsNmR9gMIti_d-tu5YCCOtSnxHK0XIapUJ95BLzb6vfTWkH1afnwZT6PPWGsSrcFoFPP_IRnOsRmTrJyI6RoUiBA5IU9nmIFEEzCMNaca1kazVU2sq6p7oS5EnGQabN-h-LmO7owH-t2HyYDaMWXWPWWOJRr4Q",
    ],
    stock: 80,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "prod-007",
    name: "Heritage Nalangu Maavu",
    slug: "heritage-nalangu-maavu",
    category: "nalangu-maavu",
    variant_name: "200g",
    price: 45,
    compare_price: null,
    description:
      "A sophisticated blend of finely milled herbal powder, rooted in ancient South Indian bathing rituals. A true representation of luxury wellness.",
    ingredients:
      "Green Gram Flour, Turmeric, Rose Petal Powder, Sandalwood Powder, Kasturi Manjal, Vetiver Root.",
    how_to_use:
      "Mix 2-3 tablespoons with water or milk to form a smooth paste. Apply to body and face. Gently scrub and rinse off for silky smooth skin.",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBgXCkm-d-V49PUtWzIPkxRFHrDYfdE-ZsltVh6xpDKw_XA1S2d5YLJJmN_Iaa7uYPboiAaquD-V9JttFysAHl5lddImDM37-oUEs1-NxvUsgAJSJg6HOPZ6rtDgjapHjrflYi4RIXg8XR3m9eVV9coeas5EyFZr3BF7HpphdcGj3VDgotqD49noilDZGkEzjgoyITklTapWKezDgLcV7W3Uw7TXNhFyooef97HMrPD-5L6EsJIjWxV-a3mD76gRRhgDCSEvQhCRny-",
    ],
    stock: 55,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "prod-008",
    name: "Saffron Glow Mask",
    slug: "saffron-glow-mask",
    category: "face-cream",
    variant_name: "60g",
    price: 55,
    compare_price: null,
    description:
      "A luxurious, tactile face mask with the richness of saffron and organic clays. Leaves your skin visibly radiant and deeply purified.",
    ingredients:
      "Saffron Extract, Kaolin Clay, Rose Water, Honey, Aloe Vera, Vitamin C.",
    how_to_use:
      "Apply a generous layer to clean, dry skin. Leave on for 15-20 minutes. Rinse off with lukewarm water. Use 2-3 times per week.",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDcJWWIADRH3uRjT8B3gMCQYOG-qmDTCyH90WjFTsaslGOFWydbdc62lw9hYBlqggmEk4W3XdBuebsaGv7GNPrm-EhcY24MX3PFPiDfV8GAJ0Ss_PofLUtaoKrz4cGttyYTAks-UJaGrr0ijzWF8EorEJK8H-Dr2bj5AIahoFqIjopLpBUG8dGqXshdnr_TIWdIloHkF-duDMHuoQlGq3-sMLCiNmSkupdewDxxE9ASJcLwLW3IKbf-7R0zcD_sxRd-jTZ1wOX3kvP0",
    ],
    stock: 30,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "prod-009",
    name: "Kumkumadi Radiance Elixir",
    slug: "kumkumadi-radiance-elixir",
    category: "face-cream",
    variant_name: "30ml",
    price: 85,
    compare_price: 110,
    description:
      "A precious blend of pure saffron, lotus extracts, and rare botanical oils. This traditional apothecary formulation works overnight to restore youthful radiance, deeply nourish, and refine skin texture.",
    ingredients:
      "Saffron Extract, Rose Water, Sandalwood Oil, Almond Oil, Sesame Oil, Vetiver Extract. 100% natural and organically sourced.",
    how_to_use:
      "After cleansing, warm 3-4 drops between your palms. Gently press into the face and neck using upward strokes. Breathe deeply to enjoy the calming botanical aroma.",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA0Zcf6U-yNWVrv1_Jbkg6C5N2-2_2mTL4hX7D2Qg0EsBKbeb8tzCDfeOKjRlaVuoyBL6LpWJsII4UUDrExXmurGRweP6htGygeqdSxHO7TfZZxDKpjJGtzVGG7-nfpNm2GfgGtendHnR_2PF3ZM7idEYHlOHxCQznticG55fVpttijrNRog5liuXnJjngkXcDU8DyBG9ZUs-k_dCIoo4Mc-JWPnoOSXlPgTcm0YPTIiqappNXPG4cSmrwbtizs7MLxD24pmXEoS_Or",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCgyh_cTkQCe5iLNl1Le_0iCI7IoPiEa6iM0og5gVrkoEr362KYtFjbrFaiSXSP3-862QlOgR_XJxB1SlvaF-qgyZWY91ZwkcDPq2L2JkxUgDMhWD1bdVezGSdDIkFCb9d_CrjeZFzyM6U7CHBxOS0rrTy_sNl921o9muAGT4aiudsdU-gm0mjBhxk7rCsQMEO_1IShgvdl7kywMqoBE3CuLKVa9Ug8DbjL6OtSEWMyQhIiJfCd42Z3YiYX6LtfXzkIWxY2o1624q2s",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAZ2ztfpr-zyHxMDm6sOQ52ZmtnrCyO7CpaS4QMHgzBmjeCZQWkZ-hf03MmAr4c9Bu1Rp5uKqp_kWvtrsgFqINI8YLaXaGp0TnCObMaHnciuJXO8RVKR2VTJ07gwip6zbXxhvxbYEJndKUIN41RHrnlNffTRbnbQLTNJ_GCHnr2HiBAQZUcByCC2uzDC9zV7spp7fCFRw42JGt4vKuwciVSLhpcmpKj-PRDwIAHI16TmQqjzMaM2hCyXbrwMJ8CLxfq3NgI2BRuHmYZ",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAOezW737cXJSUZHbBEaVmJYeeYMqc132Z-JLMXXsEv6gLwWErh-vx4iNvNrXq4XPQEJd9G8NjTA6RGHImF_CiPGZQoi7_efIWay87uGndcE9pzKl23vLNrpWERgwPszu5ajuLxQGyZFH2b4f17013rB9R7-7Ipy8Wim3NXMrOMJw4_rvpCdT1KWEmO50uKpHky6bYjaECJH7THiGF3V-ROcKZ4bJscTtwjNu0xxuJuxQDeTaHl32vuwFoBaZSxJXabatzoeKYEqbiE",
    ],
    stock: 25,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "prod-010",
    name: "Botanical Cleansing Oil",
    slug: "botanical-cleansing-oil",
    category: "face-wash",
    variant_name: "100ml",
    price: 45,
    compare_price: null,
    description:
      "A luxurious glass bottle of botanical cleansing oil. The soft, high-key studio lighting highlights the golden hue of the liquid inside.",
    ingredients:
      "Jojoba Oil, Rosehip Seed Oil, Squalane, Rose Essential Oil, Vitamin E, Chamomile Extract.",
    how_to_use:
      "Apply to dry skin and massage in circular motions. Add water to emulsify, then rinse thoroughly. Follow with your favorite moisturizer.",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAS3e7aO0ljMf-uuWOM08FigM6ee2mJHNtedFB1hcSfs7yeXGHDViCPoaUEFc2IrpA0hs64Ny9Pt_C5dyQCSrJKKh1sDh5Lpw421_vISy-uTilVFADwtcDo-LmYPCnRVUMxAg6M3GFEH_m3kn-_W-s7cgD0M4aXfWdrZ9iEsOJtNDCnN9nYzsmuSZmgPylF6GbEJthbTaMM4085niMffsfi_51WZaFoTKv9Uj8JrMDGQiJ-sayF1jqwXJF779QDe49G-U2v0dj6777k",
    ],
    stock: 35,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "prod-011",
    name: "Restorative Night Cream",
    slug: "restorative-night-cream",
    category: "face-cream",
    variant_name: "50g",
    price: 68,
    compare_price: null,
    description:
      "A frosted glass jar of night cream enriched with jasmine and marula. Works overnight to repair and rejuvenate your skin while you sleep.",
    ingredients:
      "Marula Oil, Jasmine Extract, Retinol, Hyaluronic Acid, Shea Butter, Vitamin C.",
    how_to_use:
      "Apply a generous amount to clean skin before bedtime. Gently massage in upward strokes. Allow to absorb fully before sleeping.",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDtwYWqM_9KlOczCwD-JCHGP7ucPTQkhhNbH_LcPGrsWac3qtTH7gxgMMKjias46-dxPf2uplPWstV3XBdt7H3dWLx56r_Fhf2L2GIPXEofDfsfS5K_ZwrKUS27ODUfC0S9eirAP5p_rjLR7OFTohwkw0m_OLf1iYe6MoP5_h_i1Wyk5q_J5RRjnuzQrZbuY1Qdk5psq0q65KLiIcObFCuDHgf6Rlb4zB06eZg0cFBixITEkSGXnW80HUCYWHQsZpawCo-vxtJD6soB",
    ],
    stock: 45,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "prod-012",
    name: "Purity Cleansing Balm",
    slug: "purity-cleansing-balm",
    category: "face-wash",
    variant_name: "80g",
    price: 45,
    compare_price: null,
    description:
      "A luxurious, minimalist cleansing balm sitting on a light beige stone surface. Pure, tactile, and deeply calming.",
    ingredients:
      "Mango Butter, Beeswax, Coconut Oil, Tea Tree Oil, Chamomile Extract, Vitamin E.",
    how_to_use:
      "Scoop a small amount and warm between fingers. Massage onto dry face to dissolve makeup and impurities. Rinse with warm water.",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCoUPd7HYvlk8bjy4HobPKnaf_gATfARi1GQdo3ctNndNaAGD-HtmDtZMciCDs4vdB-GkKYpnlRiG0BcpMcHmYbWSDVLmBTx5RNQDSyZsTnTbh7TDdtqB_4jZD-oD7wfdX6kucO-RbVm_GRJvVP123Pgz-WyL2vfH2VX0QRGOhGNYXh1s9BqSETmmv_3yBqZvA7ZF4XROXCDtKOMPYpXrsrmbs1W09Omv5-AHF52GreyCWkdcMjBboYhFW2kkdEjKFpReBRvjTHvKca",
    ],
    stock: 50,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return MOCK_PRODUCTS.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === "all") return MOCK_PRODUCTS.filter((p) => p.is_active);
  return MOCK_PRODUCTS.filter(
    (p) => p.category === category && p.is_active
  );
}

export function getFeaturedProducts(): Product[] {
  return MOCK_PRODUCTS.filter((p) => p.is_active).slice(0, 3);
}

export function getRelatedProducts(
  currentSlug: string,
  category: string
): Product[] {
  return MOCK_PRODUCTS.filter(
    (p) => p.slug !== currentSlug && p.category === category && p.is_active
  ).slice(0, 4);
}
