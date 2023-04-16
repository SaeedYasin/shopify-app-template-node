import { LATEST_API_VERSION, LogSeverity } from "@shopify/shopify-api";
// import { BillingInterval } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import sessions from "./prisma/database/sessions";
const { restResources } = await import(
  `@shopify/shopify-api/rest/admin/${LATEST_API_VERSION}`
);
// If you want IntelliSense for the rest resources, you should import them directly
// import { restResources } from "@shopify/shopify-api/rest/admin/2023-04";

// The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
// See the ensureBilling helper to learn more about billing in this template.
// const billingConfig = {
//   "My Shopify One-Time Charge": {
//     // This is an example configuration that would do a one-time charge for $5 (only USD is currently supported)
//     amount: 5.0,
//     currencyCode: "USD",
//     interval: BillingInterval.OneTime,
//   },
// };

const shopify = shopifyApp({
  api: {
    apiVersion: LATEST_API_VERSION,
    restResources,
    billing: undefined, // or replace with billingConfig above to enable example billing
    logger: {
      level: LogSeverity.Warning,
      timestamps: true,
    },
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
  sessionStorage: {
    storeSession: sessions.storeCallback,
    loadSession: sessions.loadCallback,
    deleteSession: sessions.deleteCallback,
    deleteSessions: sessions.deleteSessions,
    findSessionsByShop: sessions.findSessions,
  },
});

export default shopify;
