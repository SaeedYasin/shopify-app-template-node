import type { WebhookHandlersParam } from "@shopify/shopify-app-express";
import { DeliveryMethod } from "@shopify/shopify-api";

// https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#customers-data_request
// NOTE: We can't return back any data to these webhooks, according to shopify docs,
// "Once this webhook is triggered, It's your responsibility to provide this data
// to the store owner directly. In some cases, a customer record contains only
// the customer's email address."

/**
 * @type {{[key: string]: import("@shopify/shopify-api").WebhookHandler}}
 */
const GDPRWebhookHandlers: WebhookHandlersParam = {
  /**
   * Customers can request their data from a store owner. When this happens,
   * Shopify invokes this webhook.
   *
   * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#customers-data_request
   */
  CUSTOMERS_DATA_REQUEST: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (
      topic: string,
      shop: string,
      body: string,
      webhookId: string
    ) => {
      const payload = JSON.parse(body);
      console.log("Got customers data request", webhookId, payload);
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com",
      //   "orders_requested": [
      //     299938,
      //     280263,
      //     220458
      //   ],
      //   "customer": {
      //     "id": 191167,
      //     "email": "john@example.com",
      //     "phone": "555-625-1199"
      //   },
      //   "data_request": {
      //     "id": 9999
      //   }
      // }
    },
  },

  /**
   * Store owners can request that data is deleted on behalf of a customer. When
   * this happens, Shopify invokes this webhook.
   *
   * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#customers-redact
   */
  CUSTOMERS_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (
      topic: string,
      shop: string,
      body: string,
      webhookId: string
    ) => {
      const payload = JSON.parse(body);
      console.log("Got customers redact", webhookId, payload);
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com",
      //   "customer": {
      //     "id": 191167,
      //     "email": "john@example.com",
      //     "phone": "555-625-1199"
      //   },
      //   "orders_to_redact": [
      //     299938,
      //     280263,
      //     220458
      //   ]
      // }
    },
  },

  /**
   * 48 hours after a store owner uninstalls your app, Shopify invokes this
   * webhook.
   *
   * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#shop-redact
   */
  SHOP_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (
      topic: string,
      shop: string,
      body: string,
      webhookId: string
    ) => {
      const payload = JSON.parse(body);
      console.log("Got shop redact", webhookId, payload);
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com"
      // }
    },
  },
};

export default GDPRWebhookHandlers;
