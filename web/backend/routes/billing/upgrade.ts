import type { SubscriptionCreateResponse } from "../../../@types/billing";
import type { Session } from "@shopify/shopify-api";
import type { Request, Response } from "express";
import shops from "../../prisma/database/shops";
import shopify from "../../shopify";

const subscriptionPlan = {
  name: "$9.99 Plan",
  price: "9.99",
  trialDuration: 14,
};

const APP_SUBSCRIPTION_CREATE = `mutation appSubscribe(
  $name: String!
  $returnUrl: URL!
  $trialDays: Int!
  $test: Boolean!
  $price: Decimal!
) {
  appSubscriptionCreate(
    name: $name
    returnUrl: $returnUrl
    trialDays: $trialDays
    test: $test
    lineItems: [
      {
        plan: {
          appRecurringPricingDetails: {
            price: { amount: $price, currencyCode: USD }
          }
        }
      },
    ]
  ) {
    userErrors {
      field
      message
    }
    confirmationUrl
    appSubscription {
      id
    }
  }
}`;

export const upgrade = async (req: Request, res: Response) => {
  const session: Session = res.locals.shopify.session;
  const shop = session.shop;

  const shopData = await shops.getShop(shop);
  if (!shopData) {
    throw `Can't find shop of ${shop}`;
  }

  const client = new shopify.api.clients.Graphql({ session });
  const isTestCharge = shopData.test;

  const subscriptionInput = {
    name: `${subscriptionPlan.name}`,
    returnUrl: `${process.env.HOST}/api/billing/confirm?shop=${shop}`,
    trialDays:
      shopData?.subscription?.trialDays === undefined
        ? subscriptionPlan.trialDuration
        : shopData.subscription.trialDays,
    test: isTestCharge,
    price: subscriptionPlan.price,
  };

  const response = await client.query<SubscriptionCreateResponse>({
    data: {
      query: APP_SUBSCRIPTION_CREATE,
      variables: subscriptionInput,
    },
  });

  if (!response?.body?.data?.appSubscriptionCreate?.confirmationUrl) {
    const error = response?.body?.data?.appSubscriptionCreate?.userErrors;
    console.error(error);
    throw `Invalid payload returned for ${shop}`;
  }

  return response?.body.data.appSubscriptionCreate.confirmationUrl;
};
