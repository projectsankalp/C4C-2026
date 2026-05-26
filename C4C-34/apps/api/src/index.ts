import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import routes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

// Load environment variables.
// Layered loading so a single OPENAI_API_KEY at the workspace root is visible
// to every app. Workspace root loads first, then apps/api/.env wins for any
// non-empty key it defines (empty placeholders do not override).
const APP_ROOT = path.resolve(__dirname, "..");
const WORKSPACE_ROOT = path.resolve(APP_ROOT, "..", "..");
dotenv.config({ path: path.resolve(WORKSPACE_ROOT, ".env") });
const apiEnvPath = path.resolve(APP_ROOT, ".env");
if (fs.existsSync(apiEnvPath)) {
  const parsed = dotenv.parse(fs.readFileSync(apiEnvPath));
  for (const [key, value] of Object.entries(parsed)) {
    if (value !== "") process.env[key] = value;
  }
}

const app: Application = express();
const PORT = parseInt(process.env.PORT || "5000", 10);

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "*",
    credentials: true,
  }),
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", routes);

// Serve admin panel (vendor_ui) at /admin
const adminPath = path.resolve(APP_ROOT, "..", "..", "vendor_ui");
if (fs.existsSync(adminPath)) {
  app.use("/admin", express.static(adminPath));
}

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
// Bind to 127.0.0.1 by default so the API is only reachable via the local
// reverse proxy (nginx). Override with HOST=0.0.0.0 for non-proxied setups.
const HOST = process.env.HOST || "127.0.0.1";
app.listen(PORT, HOST, () => {
  // Quick AI provider self-check at boot. Helps us spot config issues before
  // any artisan request lands.
  const aiProvider = (process.env.AI_PROVIDER || "openai").toLowerCase();
  const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY);
  const listingModel = process.env.OPENAI_LISTING_MODEL || "gpt-5-mini";
  const aiPath =
    !hasOpenAIKey || aiProvider === "mock"
      ? `RULE-BASED FALLBACK (provider=${aiProvider}, key=${hasOpenAIKey ? "present" : "missing"})`
      : `LLM ENABLED (model=${listingModel})`;

  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🎨 HastKala Backend API - Person 4                 ║
║                                                       ║
║   Server running on: http://localhost:${PORT}        ║
║   Environment: ${process.env.NODE_ENV || "development"}                      ║
║   AI listing path: ${aiPath}
║                                                       ║
║   API Endpoints:                                      ║
║   • GET  /api/health                                  ║
║   • GET  /api/products                                ║
║   • POST /api/products/draft                          ║
║   • POST /api/orders                                  ║
║   • GET  /api/vendor/stats                            ║
║   • GET  /api/vendor/products/pending                 ║
║   • PATCH /api/vendor/products/:id/approve            ║
║   • GET  /api/analytics/impact                        ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

export default app;
