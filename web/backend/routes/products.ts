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

productRoutes.get("/create/:product_count", async (req, res) => {
  const { product_count } = req.params;
  let status = 200;
  let error = null;
  try {
    await productCreator(res.locals.shopify.session, +product_count);
  } catch (e) {
    console.log(`Failed to process products/create: ${(e as Error).message}`);
    status = 500;
    error = (e as Error).message;
  }
  res.status(status).send({ success: status === 200, error });
});

export default productRoutes;
