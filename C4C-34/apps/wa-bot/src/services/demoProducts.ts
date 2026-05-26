import type { ProductListItem } from "./listingService";

export const demoProducts: ProductListItem[] = [
  {
    id: "demo-home-1",
    title: "Handmade Coconut Shell Table Lamp",
    price: 600,
    quantity: 4,
    category: "Home Decor",
    district: "Dakshina Kannada",
    imageUrl: "https://placehold.co/800x800?text=Coconut+Shell+Lamp",
    artisan: { id: "demo-a1", name: "Lakshmi", district: "Dakshina Kannada", isVerified: true },
  },
  {
    id: "demo-home-2",
    title: "Banana Fiber Storage Basket",
    price: 850,
    quantity: 6,
    category: "Home Decor",
    district: "Kasaragod",
    imageUrl: "https://placehold.co/800x800?text=Banana+Fiber+Basket",
    artisan: { id: "demo-a2", name: "Meera", district: "Kasaragod", isVerified: true },
  },
  {
    id: "demo-textile-1",
    title: "Handwoven Cotton Dharwad Saree",
    price: 2400,
    quantity: 2,
    category: "Textiles",
    district: "Dharwad",
    imageUrl: "https://placehold.co/800x800?text=Dharwad+Saree",
    artisan: { id: "demo-a3", name: "Savita", district: "Dharwad", isVerified: true },
  },
  {
    id: "demo-jewellery-1",
    title: "Channapatna Beaded Necklace",
    price: 720,
    quantity: 5,
    category: "Jewellery",
    district: "Channapatna",
    imageUrl: "https://placehold.co/800x800?text=Beaded+Necklace",
    artisan: { id: "demo-a4", name: "Asha", district: "Channapatna", isVerified: true },
  },
  {
    id: "demo-food-1",
    title: "Homemade Ragi Laddoo Box",
    price: 280,
    quantity: 15,
    category: "Food Products",
    district: "Mysuru",
    imageUrl: "https://placehold.co/800x800?text=Ragi+Laddoo",
    artisan: { id: "demo-a5", name: "Parvathi", district: "Mysuru", isVerified: true },
  },
  {
    id: "demo-gift-1",
    title: "Palm Leaf Gift Hamper",
    price: 950,
    quantity: 8,
    category: "Gifts",
    district: "Udupi",
    imageUrl: "https://placehold.co/800x800?text=Gift+Hamper",
    artisan: { id: "demo-a6", name: "Nirmala", district: "Udupi", isVerified: true },
  },
];

export function filterDemoProducts(opts: {
  category?: string;
  search?: string;
  limit?: number;
}): ProductListItem[] {
  const category = opts.category?.toLowerCase();
  const search = opts.search?.toLowerCase();

  let products = demoProducts;
  if (category) {
    products = products.filter((product) => product.category?.toLowerCase() === category);
  }
  if (search) {
    products = products.filter((product) => {
      const haystack = [
        product.title,
        product.category,
        product.district,
        product.artisan?.name,
        product.artisan?.district,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(search);
    });
  }

  return products.slice(0, opts.limit ?? 10);
}

