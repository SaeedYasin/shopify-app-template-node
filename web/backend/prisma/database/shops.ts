import { Prisma, Shop, ShopData, Subscription } from "@prisma/client";
import prisma, { tryCatch } from "./client.js";

export default {
  getShop,
  createShop,
  updateShop,
  deleteShop,
};

type TShop = Shop & {
  subscription: Subscription;
  shopData: ShopData;
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
  if (!error) return data as TShop;
  return undefined;
}

async function createShop(data: Prisma.ShopCreateInput) {
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

async function updateShop(data: Prisma.ShopUpdateInput) {
  const { data: shop, error } = await tryCatch(async () => {
    return await prisma.shop.update({
      where: {
        shop: data.shop as string,
      },
      data,
    });
  });
  if (!error) return shop as TShop;
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
