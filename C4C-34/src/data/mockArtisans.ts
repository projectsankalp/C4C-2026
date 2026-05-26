import type { Artisan } from "@/lib/types";

export const mockArtisans: Artisan[] = [
  {
    id: "a1",
    name: "Lakshmi",
    district: "Dakshina Kannada",
    village: "Ullal",
    language: "kn",
    craftType: "Coconut Shell Craft",
    story:
      "Lakshmi has been shaping coconut shells into lamps and decor for over 12 years. She learned the craft from her grandmother in Ullal, and through HastKala her work now reaches buyers far beyond the coastal markets she once depended on.",
    isVerified: true,
    yearsOfExperience: 12,
    shgName: "Suraksha Mahila Sangha",
    totalProducts: 8,
    totalOrders: 23,
    createdAt: "2026-01-12T10:00:00.000Z",
  },
  {
    id: "a2",
    name: "Meenakshi",
    district: "Channapatna",
    village: "Neelasandra",
    language: "kn",
    craftType: "Channapatna Wooden Toys",
    story:
      "Meenakshi paints traditional Channapatna toys using natural lac dyes. Her workshop, run with three other women, has supplied local fairs for years — and now ships to homes across India.",
    isVerified: true,
    yearsOfExperience: 9,
    totalProducts: 6,
    totalOrders: 41,
    createdAt: "2026-02-04T10:00:00.000Z",
  },
  {
    id: "a3",
    name: "Fathima",
    district: "Kasaragod",
    village: "Bekal",
    language: "ml",
    craftType: "Coir & Banana Fiber",
    story:
      "Fathima weaves baskets and wall decor from banana fiber and coir, sourced from her own village. Her practice supports six women artisans in her self-help group.",
    isVerified: true,
    yearsOfExperience: 7,
    totalProducts: 5,
    totalOrders: 18,
    createdAt: "2026-02-22T10:00:00.000Z",
  },
  {
    id: "a4",
    name: "Savitri",
    district: "Dharwad",
    village: "Garag",
    language: "kn",
    craftType: "Handloom Weaving",
    story:
      "Savitri weaves cotton sarees on a pit loom her family has used for three generations. Each saree takes nearly a week and carries motifs unique to north Karnataka.",
    isVerified: true,
    yearsOfExperience: 18,
    totalProducts: 4,
    totalOrders: 12,
    createdAt: "2026-03-01T10:00:00.000Z",
  },
  {
    id: "a5",
    name: "Asha",
    district: "Mysuru",
    village: "Hunsur",
    language: "kn",
    craftType: "Terracotta Pottery",
    story:
      "Asha shapes terracotta diyas and planters on a hand-turned wheel. She trained at a regional crafts cluster and now leads a small unit of five women near Hunsur.",
    isVerified: true,
    yearsOfExperience: 11,
    totalProducts: 7,
    totalOrders: 30,
    createdAt: "2026-03-15T10:00:00.000Z",
  },
];

export function getArtisan(id: string) {
  return mockArtisans.find((a) => a.id === id);
}
