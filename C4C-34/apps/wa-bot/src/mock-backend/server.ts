/**
 * Mock HastKala backend.
 *
 * Lets us develop & demo independently of Person 4. Implements just enough
 * of the API contract to satisfy the WhatsApp bot:
 *   - POST /api/products/draft         → returns a synthesized draft
 *   - POST /api/whatsapp/inbound       → 204 no-op
 *   - POST /api/artisans/find-or-create → echoes back an artisan record
 *   - GET  /api/health                 → status check
 *
 * Run: npm run dev:mock-backend
 * Then point the bot at it via BACKEND_URL=http://localhost:4000 in .env
 */
import express, { Request, Response } from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import { config } from "../config";
import { log } from "../utils/logger";
import { synthesizeDraft } from "../services/productService";
import { demoProducts, filterDemoProducts } from "../services/demoProducts";

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

const drafts = new Map<string, any>();

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    data: { service: "hastkala-mock-backend", time: new Date().toISOString() },
  });
});

app.post("/api/products/draft", (req: Request, res: Response) => {
  const { phone, message, imageUrl, district, language, craftType, artisanName, source } =
    req.body || {};

  if (!phone || !message) {
    return res.status(400).json({
      success: false,
      error: { message: "phone and message are required", code: "VALIDATION_ERROR" },
    });
  }

  const draft = synthesizeDraft({
    phone,
    message,
    imageUrl,
    district,
    language,
    craftType,
    artisanName,
    source: source ?? "whatsapp",
  });

  drafts.set(draft.id, draft);
  log.info("MOCK_DRAFT_CREATED", { id: draft.id, title: draft.title, price: draft.price });

  return res.json({
    success: true,
    message: "Product draft created and sent for approval",
    data: draft,
  });
});

app.get("/api/products", (req, res) => {
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : 10;
  const products = filterDemoProducts({
    category,
    search,
    limit: Number.isFinite(limit) ? limit : 10,
  });

  return res.json({
    success: true,
    data: {
      products,
      pagination: { total: products.length, limit: limit || 10, offset: 0 },
    },
  });
});

app.get("/api/products/trending", (_req, res) => {
  return res.json({
    success: true,
    data: {
      trending: demoProducts.slice(0, 5).map((product, index) => ({
        ...product,
        artisanName: product.artisan?.name,
        district: product.artisan?.district ?? product.district,
        orderCount: 12 - index,
      })),
    },
  });
});

app.get("/api/products/:id", (req, res) => {
  const demoProduct = demoProducts.find((product) => product.id === req.params.id);
  if (demoProduct) {
    return res.json({ success: true, data: demoProduct });
  }

  const draft = drafts.get(req.params.id);
  if (!draft) {
    return res.status(404).json({
      success: false,
      error: { message: "Product not found", code: "NOT_FOUND" },
    });
  }
  return res.json({ success: true, data: draft });
});

app.post("/api/artisans/find-or-create", (req, res) => {
  const { phone, name, district } = req.body || {};
  if (!phone) {
    return res.status(400).json({
      success: false,
      error: { message: "phone is required", code: "VALIDATION_ERROR" },
    });
  }
  return res.json({
    success: true,
    data: {
      id: `artisan_${randomUUID().slice(0, 8)}`,
      phone,
      name: name || "Artisan",
      district: district || "Unknown",
      isVerified: false,
    },
  });
});

app.get("/api/orders", (_req, res) => {
  return res.json({
    success: true,
    data: {
      orders: [
        {
          id: "demo-order-1",
          totalAmount: 600,
          status: "delivered",
          product: { title: "Handmade Coconut Shell Table Lamp" },
        },
        {
          id: "demo-order-2",
          totalAmount: 280,
          status: "processing",
          product: { title: "Homemade Ragi Laddoo Box" },
        },
      ],
    },
  });
});

app.post("/api/whatsapp/inbound", (_req, res) => {
  return res.status(204).end();
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { message: `Route not found: ${req.method} ${req.originalUrl}` },
  });
});

const port = config.mockBackendPort;
app.listen(port, () => {
  log.info("MOCK_BACKEND_STARTED", { port, url: `http://localhost:${port}` });
  console.log("");
  console.log(`  Mock backend listening at http://localhost:${port}`);
  console.log(`  Set BACKEND_URL=http://localhost:${port} in .env to use it from the bot.`);
  console.log("");
});
