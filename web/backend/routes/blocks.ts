import type { GraphqlQueryError, Session } from "@shopify/shopify-api";
import type { GraphqlClient } from "@shopify/shopify-api/lib/clients/graphql/graphql_client";
import express from "express";
import type {
  AppInstallationIdResponse,
  AppMetafieldsResponse,
} from "../../@types/app";
import type {
  BlockMetaField,
  BlockMetaFieldSetResponse,
  BlockPayload,
} from "../../@types/block";
import shopify from "../shopify.js";

const blockRoutes = express.Router();

const APP_INSTALLATION_ID = `query {
  currentAppInstallation {
    id
  }
}`;

const METAFIELDS_SET = `mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
    metafields {
      id
    }
    userErrors {
      message
    }
  }
}`;

const APP_METAFIELDS = `query($namespace: String!) {
  currentAppInstallation {
    metafields(first: 50, namespace: $namespace) {
      edges {
        node {
          id
          namespace
          key
          value
        }
      }
    }
  }
}`;

function handleUserError(userErrors: GraphqlQueryError[]) {
  if (userErrors && userErrors.length > 0) {
    const message = userErrors.map((error) => error.message).join(" ");
    throw new Error(message);
  }
}

export async function setMetaFields(
  ownerId: string,
  metafields: BlockMetaField[],
  graphqlClient: GraphqlClient
) {
  const res = await graphqlClient.query<BlockMetaFieldSetResponse>({
    data: {
      query: METAFIELDS_SET,
      variables: {
        metafields: metafields.map((metafield) => ({
          ...metafield,
          ownerId,
        })),
      },
    },
  });

  const setResult = res?.body?.data?.metafieldsSet;
  if (setResult === undefined) {
    throw new Error("Failed to set customization metafields");
  }
  handleUserError(setResult.userErrors);
  return setResult;
}

async function getAppInstallationId(client: GraphqlClient) {
  const appInstallationIdResponse =
    await client.query<AppInstallationIdResponse>({
      data: {
        query: APP_INSTALLATION_ID,
      },
    });
  return appInstallationIdResponse.body.data.currentAppInstallation.id;
}

async function getAppMetafields(namespace: string, client: GraphqlClient) {
  const metafieldsResponse = await client.query<AppMetafieldsResponse>({
    data: {
      query: APP_METAFIELDS,
      variables: {
        namespace,
      },
    },
  });
  return metafieldsResponse.body.data.currentAppInstallation.metafields.edges;
}

blockRoutes.get("/:namespace/:key", async (req, res) => {
  try {
    const { namespace, key } = req.params;
    const session: Session = res.locals.shopify.session;
    const client = new shopify.api.clients.Graphql({ session });

    const metafields = await getAppMetafields(namespace, client);
    const metafield = metafields.find((mf) => mf.node.key === key)?.node;
    res.status(200).send(metafield || {});
  } catch (error) {
    console.log(`Failed to process block GET: ${(error as Error)?.message}`);
    res.status(500).send((error as Error)?.message);
  }
});

blockRoutes.post("/", async (req, res) => {
  try {
    const payload: BlockPayload = req.body;
    const session: Session = res.locals.shopify.session;
    const client = new shopify.api.clients.Graphql({ session });

    const appInstallationId = await getAppInstallationId(client);
    const setResult = await setMetaFields(
      appInstallationId,
      [
        {
          namespace: payload.namespace,
          key: payload.key,
          type: "json",
          value: JSON.stringify(payload.mfValue),
        },
      ],
      client
    );
    res.status(200).send(setResult);
  } catch (error) {
    console.log(`Failed to process block POST: ${(error as Error)?.message}`);
    res.status(500).send((error as Error)?.message);
  }
});

export default blockRoutes;
