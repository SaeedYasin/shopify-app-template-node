import { Session } from "@shopify/shopify-api";
import prisma, { tryCatch } from "./client";

export default {
  storeCallback,
  loadCallback,
  deleteCallback,
  findSessions,
  deleteSession,
  deleteSessions,
};

async function storeCallback(session: Session) {
  console.log("storeCallback called with session:", session);

  const { error } = await tryCatch(async () => {
    return await prisma.session.upsert({
      where: {
        id: session.id,
      },
      update: {
        id: session.id,
        session: JSON.stringify(session.toPropertyArray()),
        shop: session.shop,
      },
      create: {
        id: session.id,
        session: JSON.stringify(session.toPropertyArray()),
        shop: session.shop,
      },
    });
  });
  if (error) return false;
  return true;
}

async function loadCallback(id: string) {
  // console.log("loadCallback called with id:", id);
  const { data, error } = await tryCatch(async () => {
    return await prisma.session.findFirst({
      where: {
        id,
      },
    });
  });
  if (!error) {
    if (!data) return undefined;
    const session = JSON.parse(data.session);
    return Session.fromPropertyArray(session);
  }
  return undefined;
}

async function deleteCallback(id: string) {
  console.log("deleteCallback called with id:", id);
  const { error } = await tryCatch(async () => {
    return await prisma.session.delete({
      where: {
        id,
      },
    });
  });
  if (error) return false;
  return true;
}

async function findSessions(shop: string) {
  console.log("findSessions called with shop:", shop);
  const { data, error } = await tryCatch(async () => {
    return await prisma.session.findMany({
      where: {
        shop,
      },
    });
  });
  if (!error) {
    if (!data) return [];
    return data.map((d) => Session.fromPropertyArray(JSON.parse(d.session)));
  }
  return [];
}

async function deleteSession(shop: string) {
  console.log("deleteSession called with shop", shop);
  const { error } = await tryCatch(async () => {
    return await prisma.session.deleteMany({
      where: {
        shop,
      },
    });
  });
  if (error) return false;
  return true;
}

async function deleteSessions(ids: string[]) {
  console.log("deleteSessions called with ids:", ids);
  for (const id of ids) {
    console.log("deleting session with id:", id);
    const { error } = await tryCatch(async () => {
      return await prisma.session.delete({
        where: {
          id,
        },
      });
    });
    if (error) return false;
  }
  return true;
}
