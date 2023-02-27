import type { SubscriptionResponse } from "../../../@types/billing";
import type { Session } from "@shopify/shopify-api";
import shopify from "../../shopify";

const GET_ACTIVE_SUBSCRIPTION = `
{
  appInstallation {
    activeSubscriptions {
      name
      status
      lineItems {
        plan {
          pricingDetails {
            ... on AppRecurringPricing {
              __typename
              price {
                amount
                currencyCode
              }
              interval
            }
          }
        }
      }
      trialDays
      test
    }
  }
}
`;

export const check = async (session: Session) => {
  const client = new shopify.api.clients.Graphql({ session });

  // Send API request to get the active subscription
  const response = await client.query<SubscriptionResponse>({
    data: GET_ACTIVE_SUBSCRIPTION,
  });

  return response?.body?.data;
};
