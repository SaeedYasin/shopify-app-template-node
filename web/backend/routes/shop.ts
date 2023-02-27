import type { ShopDataResponse } from "../../@types/shop";
import type { Session } from "@shopify/shopify-api";
import shops from "../prisma/database/shops";
import shopify from "../shopify";
import express from "express";

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
      address1
      address2
      formatted
      company
      city
      country
      zip
      phone
    }
  }
}`;

shopRoutes.get("/", async (_req, res) => {
  try {
    const session: Session = res.locals.shopify.session;
    const currentUser = session.onlineAccessInfo?.associated_user;

    const client = new shopify.api.clients.Graphql({ session });
    const response = await client.query<ShopDataResponse>({
      data: GET_SHOP_DATA,
    });

    res.status(200).send({ ...response?.body?.data, currentUser });
  } catch (error) {
    console.log("Failed to process api request:", error);
    res.status(500).send((error as Error).message);
  }
});

shopRoutes.get("/name", async (_req, res) => {
  try {
    const session: Session = res.locals.shopify.session;
    const { shop } = session;

    if (shop) {
      res.status(200).send({ shop });
    } else {
      throw new Error(`Error while fetching shop name for shop ${shop}`);
    }
  } catch (error) {
    console.log("Failed to process api request:", error);
    res.status(500).send((error as Error).message);
  }
});

shopRoutes.get("/info", async (_req, res) => {
  try {
    const session: Session = res.locals.shopify.session;
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
    const session: Session = res.locals.shopify.session;
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
