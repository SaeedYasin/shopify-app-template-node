import productCreator from "../services/product-creator";
import shopify from "../shopify";
import express from "express";

const productRoutes = express.Router();

productRoutes.get("/count", async (_req, res) => {
  try {
    const countData = await shopify.api.rest.Product.count({
      session: res.locals.shopify.session,
    });
    res.status(200).send(countData);
  } catch (error) {
    res.status(500).send((error as Error).message);
  }
});

productRoutes.post("/create/:product_count", async (req, res) => {
  const { product_count } = req.params;
  try {
    await productCreator(res.locals.shopify.session, +product_count);
    res.status(200).send();
  } catch (e) {
    console.log(`Failed to process products/create: ${(e as Error).message}`);
    res.status(500).send((e as Error).message);
  }
});

export default productRoutes;
