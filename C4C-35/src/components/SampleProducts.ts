export interface SampleProduct {
  name: string;
  description: string;
  category: string;
  icon: string;
}

export const SAMPLE_PRODUCTS: SampleProduct[] = [
  {
    name: "Handmade Lavender Soap",
    description: "Pure coconut oil base organic soaps scented with natural lavender essential oil, dried lavender buds, and safe clay colors. Gentle on skin.",
    category: "Skin Care & Beauty",
    icon: "✨",
  },
  {
    name: "Homemade Ragi & Ghee Cookies",
    description: "Healthy and crispy finger millet (ragi) cookies sweetened with jaggery, made using fresh homemade unsalted cow ghee and loaded with dry fruits.",
    category: "Food & Bakery",
    icon: "🍪",
  },
  {
    name: "Block-Printed Cotton Tote Bags",
    description: "Eco-friendly natural canvas tote bags featuring hand-carved wooden block floral patterns in rich indigo and terracotta colors. Double-stitched for durability.",
    category: "Fashion & Eco-Crafts",
    icon: "👜",
  },
  {
    name: "Hand-Painted Terracotta Pots",
    description: "Medium-sized clay pots painted manually with colorful traditional Madhubani geometric patterns, sealed with water-resistant glaze for indoor plants.",
    category: "Home Decor",
    icon: "🪴",
  },
];
