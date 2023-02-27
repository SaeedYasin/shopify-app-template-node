import type { Shop, ShopCreate, ShopUpdate } from "../../../@types/shop";
import prisma, { tryCatch } from "./client";

export default {
  getShop,
  createShop,
  updateShop,
  deleteShop,
};

async function getShop(shop: string) {
  const { data, error } = await tryCatch(async () => {
    return await prisma.shop.findFirst({
      where: {
        shop,
      },
      include: {
        subscription: true,
        shopData: true,
      },
    });
  });
  if (!error) return data as Shop;
  return undefined;
}

async function createShop(data: ShopCreate) {
  const { error } = await tryCatch(async () => {
    return await prisma.shop.create({
      data: {
        ...data,
        subscription: {
          create: {},
        },
      },
    });
  });
  if (error) return false;
  return true;
}

async function updateShop(data: ShopUpdate) {
  const { data: shop, error } = await tryCatch(async () => {
    return await prisma.shop.update({
      where: {
        shop: data.shop as string,
      },
      data,
    });
  });
  if (!error) return shop as Shop;
  return undefined;
}

async function deleteShop(shop: string) {
  const { error } = await tryCatch(async () => {
    return await prisma.shop.delete({
      where: {
        shop,
      },
    });
  });
  if (error) return false;
  return true;
}
