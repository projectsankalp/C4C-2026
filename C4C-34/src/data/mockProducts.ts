import type { Product, ArtisanSummary } from "@/lib/types";
import bananaFiberStorageBasketImage from "@/assets/products/banana-fiber-storage-basket.png";
import coconutShellTableLampImage from "@/assets/products/coconut-shell-table-lamp.png";
import dharwadCottonSareeImage from "@/assets/products/dharwad-cotton-saree.png";
import terracottaDiyaSetImage from "@/assets/products/terracotta-diya-set.png";
import { mockArtisans } from "./mockArtisans";

const summary = (id: string): ArtisanSummary | undefined => {
  const a = mockArtisans.find((x) => x.id === id);
  if (!a) return undefined;
  return {
    id: a.id,
    name: a.name,
    district: a.district,
    village: a.village,
    craftType: a.craftType,
    isVerified: a.isVerified,
    story: a.story,
  };
};

export const mockProducts: Product[] = [
  {
    id: "p1",
    artisanId: "a1",
    title: "Handmade Coconut Shell Table Lamp",
    description:
      "An eco-friendly handmade coconut shell lamp crafted by women artisans of coastal Karnataka. Each shell is hand-polished and fitted with a warm-glow bulb — perfect for reading nooks, festive corners, and thoughtful gifting.",
    price: 600,
    middlemanEstimate: 250,
    quantity: 4,
    category: "Home Decor",
    district: "Dakshina Kannada",
    imageUrl: coconutShellTableLampImage,
    status: "approved",
    aiGenerated: true,
    material: "Coconut shell, teak base",
    craftType: "Coconut Shell Craft",
    tags: ["handmade", "eco-friendly", "lamp"],
    createdAt: "2026-05-25T10:00:00.000Z",
    newFromWhatsApp: true,
    artisan: summary("a1"),
  },
  {
    id: "p2",
    artisanId: "a4",
    title: "Handwoven Cotton Dharwad Saree",
    description:
      "A six-yard handwoven cotton saree with traditional north Karnataka motifs. Woven on a pit loom over six days using natural dyes. Soft, breathable, and made to last seasons.",
    price: 2400,
    middlemanEstimate: 1100,
    quantity: 2,
    category: "Textiles",
    district: "Dharwad",
    imageUrl: dharwadCottonSareeImage,
    status: "approved",
    material: "100% handloom cotton",
    craftType: "Handloom",
    tags: ["saree", "handloom", "natural dye"],
    createdAt: "2026-05-22T10:00:00.000Z",
    artisan: summary("a4"),
  },
  {
    id: "p3",
    artisanId: "a3",
    title: "Banana Fiber Storage Basket",
    description:
      "A sturdy storage basket woven from naturally dyed banana fiber. Ideal for storing linen, magazines, or yarn — and a quiet statement of low-impact craft.",
    price: 850,
    middlemanEstimate: 400,
    quantity: 6,
    category: "Home Decor",
    district: "Kasaragod",
    imageUrl: bananaFiberStorageBasketImage,
    status: "approved",
    material: "Banana fiber, cotton thread",
    craftType: "Coir & Banana Fiber",
    tags: ["basket", "storage", "eco"],
    createdAt: "2026-05-20T10:00:00.000Z",
    artisan: summary("a3"),
  },
  {
    id: "p4",
    artisanId: "a5",
    title: "Terracotta Diya Set (Box of 12)",
    description:
      "A festive set of twelve hand-thrown terracotta diyas. Each piece is wheel-shaped, sun-dried, and finished with a smooth matte clay surface — ready for ghee or oil.",
    price: 360,
    middlemanEstimate: 150,
    quantity: 20,
    category: "Festive Items",
    district: "Mysuru",
    imageUrl: terracottaDiyaSetImage,
    status: "approved",
    material: "Natural terracotta clay",
    craftType: "Terracotta Pottery",
    tags: ["diya", "festive", "diwali"],
    createdAt: "2026-05-19T10:00:00.000Z",
    artisan: summary("a5"),
  },
  {
    id: "p5",
    artisanId: "a3",
    title: "Natural Coir Wall Decor",
    description:
      "A statement coir wall hanging woven in concentric rings. A warm, textural addition to living rooms, studios, and entryways.",
    price: 1200,
    middlemanEstimate: 550,
    quantity: 3,
    category: "Home Decor",
    district: "Kasaragod",
    imageUrl:
      "https://images.unsplash.com/photo-1582582494705-f8ce0b0c24f0?auto=format&fit=crop&w=900&q=80",
    status: "approved",
    material: "Natural coir, jute backing",
    craftType: "Coir & Banana Fiber",
    tags: ["wall decor", "boho", "handmade"],
    createdAt: "2026-05-18T10:00:00.000Z",
    artisan: summary("a3"),
  },
  {
    id: "p6",
    artisanId: "a2",
    title: "Channapatna Beaded Necklace",
    description:
      "A lightweight wooden bead necklace finished with traditional lac polish in deep sindoor and ivory. Hypoallergenic and child-safe — a quiet heirloom piece.",
    price: 720,
    middlemanEstimate: 300,
    quantity: 5,
    category: "Jewellery",
    district: "Channapatna",
    imageUrl:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80",
    status: "approved",
    material: "Ivory wood, natural lac",
    craftType: "Channapatna Wooden Toys",
    tags: ["jewellery", "wooden", "lac"],
    createdAt: "2026-05-16T10:00:00.000Z",
    artisan: summary("a2"),
  },
  {
    id: "p7",
    artisanId: "a3",
    title: "Palm Leaf Storage Box",
    description:
      "A nesting palm-leaf storage box, hand-woven and lightly varnished. Use it for jewellery, stationery, or as a thoughtful return gift.",
    price: 450,
    middlemanEstimate: 200,
    quantity: 8,
    category: "Kitchen & Dining",
    district: "Kasaragod",
    imageUrl:
      "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=900&q=80",
    status: "approved",
    material: "Palm leaf, food-safe varnish",
    craftType: "Palm Leaf Weaving",
    tags: ["storage", "gift", "eco"],
    createdAt: "2026-05-15T10:00:00.000Z",
    artisan: summary("a3"),
  },
  {
    id: "p8",
    artisanId: "a4",
    title: "Embroidered Cotton Pouch",
    description:
      "A small cotton pouch with traditional running-stitch embroidery, finished with a wooden bead drawstring. Sized to hold a phone, kohl, and a few quiet things.",
    price: 320,
    middlemanEstimate: 130,
    quantity: 12,
    category: "Bags & Accessories",
    district: "Dharwad",
    imageUrl:
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=900&q=80",
    status: "approved",
    material: "Cotton, cotton thread, wooden bead",
    craftType: "Hand Embroidery",
    tags: ["pouch", "embroidery", "gift"],
    createdAt: "2026-05-12T10:00:00.000Z",
    artisan: summary("a4"),
  },
];

export function getProduct(id: string) {
  const directMatch = mockProducts.find((p) => p.id === id);
  if (directMatch) return directMatch;

  const aliasId = PRODUCT_ID_ALIASES[id];
  if (aliasId) return mockProducts.find((p) => p.id === aliasId);

  if (!id) return undefined;
  return mockProducts[getFallbackProductIndex(id)];
}

export function getMockProductImage(id: string) {
  const productId = PRODUCT_ID_ALIASES[id] ?? id;
  return mockProducts.find((p) => p.id === productId)?.imageUrl;
}

export function getProductsByArtisan(artisanId: string) {
  return mockProducts.filter((p) => p.artisanId === artisanId);
}

export const CATEGORIES = [
  "Home Decor",
  "Textiles",
  "Jewellery",
  "Kitchen & Dining",
  "Festive Items",
  "Bags & Accessories",
];

export const DISTRICTS = [
  "Dakshina Kannada",
  "Mysuru",
  "Dharwad",
  "Channapatna",
  "Kasaragod",
];

const PRODUCT_ID_ALIASES: Record<string, string> = {
  prod_lamp: "p1",
  prod_basket: "p3",
  prod_pending_dupatta: "p2",
};

function getFallbackProductIndex(id: string) {
  let hash = 0;
  for (const char of id) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash % mockProducts.length;
}
