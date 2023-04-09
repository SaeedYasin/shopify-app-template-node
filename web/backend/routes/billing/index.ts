import express, { type Request, type Response } from "express";
import type { Session } from "@shopify/shopify-api";
import { upgrade } from "./upgrade";
import { downgrade } from "./downgrade";
import { confirm } from "./confirm";
import { check } from "./check";

const billingRoutes = express.Router();

// GET api/billing -> Get subscription data
billingRoutes.get("/", async (_req: Request, res: Response) => {
  try {
    const session: Session = res.locals.shopify.session;
    const data = await check(session);
    res.status(200).send(data);
  } catch (error) {
    console.log("Failed to process api request:", error);
    res.status(500).send((error as Error).message);
  }
});

// POST api/billing -> Create a subscription plan charge
billingRoutes.post("/", async (req: Request, res: Response) => {
  try {
    const newSubscriptionUrl = await upgrade(req, res);
    res.status(200).send({
      url: newSubscriptionUrl,
    });
  } catch (error) {
    console.log("Failed to process api request:", error);
    res.status(500).send((error as Error).message);
  }
});

// DELETE api/billing -> Deletes a subscription plan charge. Downgrades to Free.
billingRoutes.delete("/", async (req: Request, res: Response) => {
  try {
    const { success } = await downgrade(req, res);
    res.status(200).send({
      success: success,
    });
  } catch (error) {
    console.log("Failed to process api request:", error);
    res.status(500).send((error as Error).message);
  }
});

export const billingUnauthenticatedRoutes = express.Router();

// GET api/billing/confirm -> Save subscription to database
billingUnauthenticatedRoutes.get(
  "/confirm",
  async (req: Request, res: Response) => {
    try {
      const { shop } = await confirm(req);
      res.redirect(
        `https://admin.shopify.com/store/${shop.split(".")[0]}/apps/${
          process.env.APP_SLUG
        }/settings`
      );
    } catch (error) {
      console.log("Failed to process api request:", error);
      res.status(500).send((error as Error).message);
    }
  }
);

export default billingRoutes;
