import type { SubscriptionCancelResponse } from "../../../@types/billing";
import type { Request, Response } from "express";
import type { Session } from "@shopify/shopify-api";
import { composeGid } from "@shopify/admin-graphql-api-utilities";
import mixpanel from "../../lib/mixpanel";
import shops from "../../prisma/database/shops";
import shopify from "../../shopify";

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
  const session: Session = res.locals.shopify.session;
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
  const response = await client.query<SubscriptionCancelResponse>({
    data: {
      query: APP_SUBSCRIPTION_CANCEL,
      variables: {
        id: `${composeGid("AppSubscription", chargeId)}`,
      },
    },
  });

  if (!response?.body?.data?.appSubscriptionCancel) {
    const error = response?.body?.data?.appSubscriptionCancel?.userErrors;
    console.error(error);
    throw `Invalid payload returned for ${shop} on ${chargeId}`;
  }

  // Make sure the API call was successful
  const { status } = response.body.data.appSubscriptionCancel.appSubscription;
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

  mixpanel.track("Subscription deactivated", {
    shop,
    distinct_id: shop,
    plan: shopData.subscription.plan,
    active: shopData.subscription.active,
    test: shopData.subscription.test,
    trialDays: shopData.subscription.trialDays,
    createdAt: shopData.subscription.createdAt,
    chargeId: shopData.subscription.chargeId,
  });

  console.log(
    `Event Downgrade: ${shopData.shop} downgraded to trial plan.`,
    `Cancelled charge id: ${chargeId}`
  );

  return { success: true };
};
