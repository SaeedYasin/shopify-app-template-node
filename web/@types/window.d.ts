export * from "@total-typescript/ts-reset";

declare global {
  interface Window {
    __SHOPIFY_DEV_HOST: string;
  }
}
