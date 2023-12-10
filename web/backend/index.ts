import type { Session } from "@shopify/shopify-api";
import type { NextFunction, Request, Response } from "express";
import express from "express";
import expressServeStaticGzip from "express-static-gzip";
import { readFileSync } from "fs";
import { join } from "path";
import shopify from "./shopify";

// Import Middleware
import updateShopDataMiddleware from "./middleware/shopData";

// Import Webhooks
import PrivacyWebhookHandlers from "./webhooks/privacy";
import addUninstallWebhookHandler from "./webhooks/uninstall";

// Import Routes
import bugsnag from "./lib/bugsnag.js";
import billingRoutes, {
  billingUnauthenticatedRoutes,
} from "./routes/billing/index";
import blockRoutes from "./routes/blocks";
import productRoutes from "./routes/products";
import shopRoutes from "./routes/shop";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "8081",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/../frontend/dist`
    : `${process.cwd()}/../frontend/`;

const app = express();
const bs_middleware = bugsnag.getPlugin("express");

// This must be the first piece of middleware in the stack.
// It can only capture errors in downstream middleware
if (bs_middleware?.requestHandler) {
  app.use(bs_middleware.requestHandler);
}

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
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);
await addUninstallWebhookHandler();

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

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
app.use("/api/block", blockRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/billing", billingRoutes);

app.use(shopify.cspHeaders());
app.use(
  expressServeStaticGzip(STATIC_PATH, {
    enableBrotli: true,
    index: false,
    orderPreference: ["br", "gz"],
  })
);

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

// This handles any errors that Express catches. This needs to go before other
// error handlers. BugSnag will call the `next` error handler if it exists.
if (bs_middleware?.errorHandler) {
  app.use(bs_middleware.errorHandler);
}

app.listen(PORT);
console.log(`App running on port: ${PORT} ...`);
