import express from "express";
import shops from "../prisma/database/shops.js";
import shopify from "../shopify.js";

const shopRoutes = express.Router();

const GET_SHOP_DATA = `{
  shop {
    id
    name
    ianaTimezone
    email
    url
    currencyCode
    primaryDomain {
      url
      sslEnabled
    }
    plan {
      displayName
      partnerDevelopment
      shopifyPlus
    }
    billingAddress {
      name
      company
      city
      country
      phone
    }
  }
}`;

shopRoutes.get("/", async (_req, res) => {
  try {
    const session = res.locals.shopify.session;
    const currentUser = session.onlineAccessInfo.associated_user;

    const client = new shopify.api.clients.Graphql({ session });
    const response = await client.query({
      data: GET_SHOP_DATA,
    });
    const resBody = response?.body as any;

    res.status(200).send({ ...resBody, currentUser });
  } catch (error) {
    console.log("Failed to process api request:", error);
    res.status(500).send((error as Error).message);
  }
});

shopRoutes.get("/info", async (_req, res) => {
  try {
    const session = res.locals.shopify.session;
    const { shop } = session;

    const shopInfo = await shops.getShop(shop);

    if (shopInfo) {
      res.status(200).send(shopInfo);
    } else {
      throw new Error(`Error while fetching shopInfo for shop ${shop}`);
    }
  } catch (error) {
    console.log("Failed to process api request:", error);
    res.status(500).send((error as Error).message);
  }
});

shopRoutes.post("/update", async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const { shop } = session;

    const shopInfo = await shops.updateShop({ shop, ...req.body });

    if (shopInfo) {
      res.status(200).send(shopInfo);
    } else {
      throw new Error(`Error while fetching shopInfo for shop ${shop}`);
    }
  } catch (error) {
    console.log(`Failed to process api request: ${error}`);
    res.status(500).send((error as Error).message);
  }
});

export default shopRoutes;
