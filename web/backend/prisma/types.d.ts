import {
  Prisma,
  Shop as PrismaShop,
  ShopData,
  Subscription,
} from "@prisma/client";

export type Shop = PrismaShop & {
  subscription: Subscription;
  shopData: ShopData;
};

export type ShopCreate = Prisma.ShopCreateInput;
export type ShopUpdate = Prisma.ShopUpdateInput;
