import { GraphqlQueryError } from "@shopify/shopify-api";

export interface BlockPayload {
  namespace: string;
  key: string;
  mfValue: { [key: string]: string };
}

export interface BlockMetaField {
  namespace: string;
  key: string;
  type: string;
  value: string;
}

export interface BlockMetaFieldSetResponse {
  data: {
    metafieldsSet: {
      metafields: {
        id: string;
      }[];
      userErrors: GraphqlQueryError[];
    };
  };
}
