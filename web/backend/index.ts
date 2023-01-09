// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import type { Session } from "@shopify/shopify-api";
import serveStatic from "serve-static";
import shopify from "./shopify.js";

// Import Middleware
import updateShopDataMiddleware from "./middleware/shopData.js";

// Import Webhooks
import addUninstallWebhookHandler from "./webhooks/uninstall.js";
import GDPRWebhookHandlers from "./webhooks/gdpr.js";

// Import Routes
import productRoutes from "./routes/products.js";
import shopRoutes from "./routes/shop.js";
import billingRoutes, {
  billingUnauthenticatedRoutes,
} from "./routes/billing/index.js";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "8081",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/../frontend/dist`
    : `${process.cwd()}/../frontend/`;

const app = express();

// Set up Shopify authentication
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  updateShopDataMiddleware(app),
  shopify.redirectToShopifyOrAppRoot()
);

// Set up Shopify webhooks handling
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);
await addUninstallWebhookHandler();

// Unauthenticated routes
app.use("/api/billing", billingUnauthenticatedRoutes);

// All endpoints after this point will require an active session
app.use("/api/*", shopify.validateAuthenticatedSession());

// Print all requested paths
app.use("/*", (req: Request, res: Response, next: NextFunction) => {
  const shop = req.query.shop;
  if (shop) {
    console.log("-->", req.baseUrl + req.path, "| { shop: " + shop + " }");
  }
  return next();
});

app.use("/api/*", (req: Request, res: Response, next: NextFunction) => {
  const session: Session = res.locals?.shopify?.session;
  const shop = session?.shop;
  console.log("-->", req.baseUrl + req.path, "| { shop: " + shop + " }");
  return next();
});

app.use(express.json());
app.use("/api/products", productRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/billing", billingRoutes);

app.use(serveStatic(STATIC_PATH, { index: false }));

// Reply to health check to let server know we are ready
app.use("/health", (_req, res) => {
  res.status(200).send();
});

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);
console.log(`App running on port: ${PORT} ...`);
