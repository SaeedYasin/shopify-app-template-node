import { composeGid } from "@shopify/admin-graphql-api-utilities";
import shopify from "../../shopify.js";
import shops from "../../prisma/database/shops.js";
import { Request, Response } from "express";
// import analytics from "../../../lib/segment/index.js";

export const APP_SUBSCRIPTION_CANCEL = `mutation appSubscriptionCancel(
    $id: ID!
  ) {
    appSubscriptionCancel(
      id: $id
    ) {
      appSubscription {
        id
        status
      }
      userErrors {
        field
        message
      }
    }
}`;

export const downgrade = async (req: Request, res: Response) => {
  const session = res.locals.shopify.session;
  const shop = session.shop;

  // Retrieve shop data
  const shopData = await shops.getShop(shop);
  if (!shopData) {
    throw `Shop ${shop} not found`;
  }

  // Store the active subscription charge id
  const chargeId = shopData.subscription?.chargeId;
  if (!chargeId) {
    throw `No charge id on ${shop}`;
  }

  // Create client
  const client = new shopify.api.clients.Graphql({ session });

  // Send API request to cancel the subscription
  const response = await client.query({
    data: {
      query: APP_SUBSCRIPTION_CANCEL,
      variables: {
        id: `${composeGid("AppSubscription", chargeId)}`,
      },
    },
  });
  const resBody = response?.body as any;
  if (!resBody?.data?.appSubscriptionCancel) {
    const error = resBody?.data?.appSubscriptionCreate?.userErrors;
    console.error(error);
    throw `Invalid payload returned for ${shop} on ${chargeId}`;
  }

  // Make sure the API call was successful
  const { status } = resBody.data.appSubscriptionCancel.appSubscription;
  if (status !== "CANCELLED") {
    throw `Status of CANCELLED expected but received ${status}`;
  }

  // Delete subscription
  const dbResponse = await shops.updateShop({
    shop,
    subscription: {
      update: {
        active: true,
        plan: "TRIAL",
        createdAt: new Date(),
        upgradedAt: null,
        currentPeriodEnd: null,
        chargeId: null,
      },
    },
  });

  if (!dbResponse) {
    throw `Could not update subscription in the database for ${shop}`;
  }

  // analytics.track({
  //   userId: shop,
  //   event: "Subscription deactivated",
  //   properties: {
  //     chargeId: shopData.subscription.chargeId,
  //     name: shopData.subscription.name,
  //     price: shopData.subscription.price,
  //     isTest: shopData.subscription.test,
  //     status: shopData.subscription.status,
  //     trialDuration: shopData.subscription.trialDays,
  //   },
  // });

  console.log(
    `Event Downgrade: ${shopData.shop} downgraded to trial plan.`,
    `Cancelled charge id: ${chargeId}`
  );

  return { success: true };
};
