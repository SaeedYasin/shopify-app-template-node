import { DeliveryMethod } from "@shopify/shopify-api";
import mixpanel from "../lib/mixpanel";
import shops from "../prisma/database/shops";
import shopify from "../shopify";

function getDifferenceInDaysFromCurrentDate(date1Str: Date) {
  const date1 = new Date(date1Str);
  const date2 = new Date();
  const diffTime = Math.abs(+date2 - +date1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function getNewTrialDaysValue(currentTrialDays: number, installedAt: Date) {
  const diffDays = getDifferenceInDaysFromCurrentDate(installedAt);
  const newTrialDays = currentTrialDays - diffDays;
  return newTrialDays > 0 ? newTrialDays : 0;
}

async function uninstall(shop: string) {
  console.log("Event: Uninstall on shop", shop);

  const shopData = await shops.getShop(shop);
  const trialDaysObj = shopData?.installedAt
    ? {
        trialDays: getNewTrialDaysValue(
          shopData.subscription.trialDays,
          shopData.installedAt
        ),
      }
    : {};

  await shops.updateShop({
    shop,
    isInstalled: false,
    uninstalledAt: new Date(),
    subscription: {
      update: {
        active: false,
        ...trialDaysObj,
      },
    },
  });

  mixpanel.track("App Uninstall", {
    shop,
    distinct_id: shop,
    trialDaysLeft: trialDaysObj ? trialDaysObj.trialDays : "Unknown",
  });
}

export default async function addUninstallWebhookHandler() {
  await shopify.api.webhooks.addHandlers({
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/api/webhooks",
      callback: async (topic: string, shop: string) => {
        console.log("Uninstall app webhook invoked", topic, shop);
        await uninstall(shop);
      },
    },
  });
}
