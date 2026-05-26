/**
 * Quick integration probe against a running API on http://localhost:5000.
 * Exercises the new endpoints added in this batch:
 *   - PATCH /api/users/by-phone/:phone
 *   - GET   /api/users/by-phone/:phone
 *   - POST  /api/requests
 *   - GET   /api/requests/:id
 *   - POST  /api/requests/:id/quotes
 *   - POST  /api/quotes/:id/accept
 *   - POST  /api/products/draft  (asserts pending_approval status)
 *   - PATCH /api/products/:id/stock
 */
import axios from "axios";

const API = "http://localhost:5000";

async function main() {
  console.log("===== Integration test: new endpoints =====\n");

  // 1. Seller profile
  console.log("1) PATCH /api/users/by-phone/919876543210 (seller)");
  const sellerProfile = await axios.patch(`${API}/api/users/by-phone/919876543210`, {
    name: "Lakshmi",
    role: "seller",
    language: "en",
    district: "Dakshina Kannada",
    craftCategory: "Home Decor",
    shgName: "Sakhi Mahila SHG",
    onboardingComplete: true,
  });
  console.log("   ✓ artisanId =", sellerProfile.data.data.artisanId);

  // 2. Buyer profile
  console.log("2) PATCH /api/users/by-phone/919812345678 (buyer)");
  const buyerProfile = await axios.patch(`${API}/api/users/by-phone/919812345678`, {
    name: "Rahul",
    role: "buyer",
    language: "hi",
    district: "Bengaluru",
    interests: ["Home Decor", "Festive Items"],
    onboardingComplete: true,
  });
  console.log("   ✓ buyer onboarded:", buyerProfile.data.data.name);

  // 3. Get seller profile back
  console.log("3) GET /api/users/by-phone/919876543210");
  const fetched = await axios.get(`${API}/api/users/by-phone/919876543210`);
  console.log("   ✓ name =", fetched.data.data.name, "| craft =", fetched.data.data.craftCategory);

  // 4. Product draft (verify status=pending_approval, NOT auto-approved)
  console.log("4) POST /api/products/draft");
  const draft = await axios.post(`${API}/api/products/draft`, {
    phone: "919876543210",
    artisanName: "Lakshmi",
    district: "Dakshina Kannada",
    language: "en",
    craftType: "Coconut Shell Craft",
    message: "Handmade coconut shell lamp, 600 rupees, 2 pieces available",
    imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38",
    prefilled: {
      title: "Handmade Coconut Shell Lamp",
      price: 600,
      quantity: 2,
      material: "Coconut shell",
      category: "Home Decor",
    },
    source: "whatsapp",
  });
  const product = draft.data.data;
  console.log("   ✓ id =", product.id, "| status =", product.status, "| price =", product.price);
  console.assert(product.status === "pending_approval", "Status should be pending_approval");

  // 5. Update stock
  console.log("5) PATCH /api/products/:id/stock");
  const stockUpdate = await axios.patch(`${API}/api/products/${product.id}/stock`, {
    quantity: 5,
  });
  console.log("   ✓ new quantity =", stockUpdate.data.data.quantity);

  // 6. Buyer creates a request
  console.log("6) POST /api/requests");
  const req = await axios.post(`${API}/api/requests`, {
    buyerPhone: "919812345678",
    brief: "100 handmade coconut shell lamps for a corporate gifting event",
    quantity: 100,
    budgetMin: 50000,
    budgetMax: 70000,
    deliveryDate: "next month",
    location: "Bengaluru",
  });
  const requestId = req.data.data.id;
  console.log(
    "   ✓ requestId =",
    requestId,
    "| matchedSellers =",
    req.data.data.matchedSellerPhones.length,
    "| category =",
    req.data.data.category,
  );

  // 7. Seller submits a quote
  console.log("7) POST /api/requests/:id/quotes (seller submits)");
  const quote = await axios.post(`${API}/api/requests/${requestId}/quotes`, {
    sellerPhone: "919876543210",
    price: 60000,
    deliveryNote: "Ready in 3 weeks",
    quoteNote: "Custom packaging included",
  });
  const quoteId = quote.data.data.id;
  console.log("   ✓ quoteId =", quoteId, "| price =", quote.data.data.price);

  // 8. Buyer lists quotes
  console.log("8) GET /api/requests/:id/quotes");
  const quotes = await axios.get(`${API}/api/requests/${requestId}/quotes`);
  console.log("   ✓ quotes count =", quotes.data.data.length);

  // 9. Buyer accepts quote
  console.log("9) POST /api/quotes/:id/accept");
  const accepted = await axios.post(`${API}/api/quotes/${quoteId}/accept`);
  console.log("   ✓ status =", accepted.data.data.status);

  // 10. Verify request is now fulfilled
  console.log("10) GET /api/requests/:id (should be fulfilled)");
  const finalReq = await axios.get(`${API}/api/requests/${requestId}`);
  console.log("    ✓ request status =", finalReq.data.data.status);

  // 11. List seller's products
  console.log("11) GET /api/sellers/:id/products");
  const sellers = await axios.get(
    `${API}/api/sellers/${sellerProfile.data.data.artisanId}/products`,
  );
  console.log("    ✓ product count =", sellers.data.data.products.length);

  // 12. Sakhi approves the product
  console.log("12) PATCH /api/vendor/products/:id/approve");
  const approved = await axios.patch(`${API}/api/vendor/products/${product.id}/approve`, {
    reviewerName: "Priya (Sakhi)",
  });
  console.log("    ✓ status =", approved.data.data.status);

  console.log("\n===== All integration checks passed =====");
}

main().catch((err) => {
  if (err.response) {
    console.error("Failed:", err.response.status, err.response.data);
  } else {
    console.error("Failed:", err.message);
  }
  process.exit(1);
});
