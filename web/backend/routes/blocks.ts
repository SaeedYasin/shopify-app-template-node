import type { Session } from "@shopify/shopify-api";
import shopify from "../shopify";
import express from "express";

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

function handleUserError(userErrors: any[]) {
  if (userErrors && userErrors.length > 0) {
    const message = userErrors.map((error) => error.message).join(" ");
    throw new Error(message);
  }
}

export async function setMetaFields(
  ownerId: string,
  metafields: any[],
  graphqlClient: any
) {
  // @ts-ignore
  const res = await graphqlClient.query<any>({
    data: {
      query: METAFIELDS_SET,
      variables: {
        metafields: metafields.map((metafield) => ({
          ...metafield,
          ownerId: ownerId,
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

blockRoutes.get("/set-value", async (req, res) => {
  let status = 200;
  let error = null;
  try {
    const session: Session = res.locals.shopify.session;
    const client = new shopify.api.clients.Graphql({ session });

    // Get appInstallationId
    const appInstallationId = await client.query({
      data: {
        query: APP_INSTALLATION_ID,
      },
    });
    console.log(
      "appInstallationId",
      // @ts-ignore
      appInstallationId.body.data.currentAppInstallation.id
    );

    const value = {
      title: "Customization title",
      description: "Customization description",
    };

    // @ts-ignore
    const ownerId = appInstallationId.body.data.currentAppInstallation.id;
    console.log("ownerId", ownerId);
    const setResult = await setMetaFields(
      ownerId,
      [
        {
          namespace: "namespace",
          key: "key",
          type: "json",
          value: JSON.stringify(value),
        },
      ],
      client
    );
    console.log("setResult", setResult);

    const metafields = await client.query({
      data: {
        query: APP_METAFIELDS,
        variables: {
          namespace: "namespace",
        },
      },
    });
    console.log(
      "metafields",
      // @ts-ignore
      metafields.body.data.currentAppInstallation.metafields.edges
    );
  } catch (e) {
    console.log(`Failed to process blocks/set-value: ${(e as Error).message}`);
    status = 500;
    error = (e as Error).message;
  }
  res.status(status).send({ success: status === 200, error });
});

export default blockRoutes;
