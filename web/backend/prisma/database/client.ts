import { Prisma } from "@prisma/client";
import Prisma1, * as Prisma2 from "@prisma/client";
const Prisma3 = Prisma1 || Prisma2;

const prisma = new Prisma3.PrismaClient({ errorFormat: "minimal" });
export default prisma;

export async function tryCatch<T>(cb: () => Promise<T>) {
  try {
    return { data: await cb(), error: undefined };
  } catch (e) {
    return { error: processError(e), data: undefined };
  }
}

function processError(e: Error | unknown) {
  console.log(e);
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2003") {
      return {
        code: e.code,
        msg: "There is a unique constraint violation",
      };
    }
  }
  return { code: "UNKNOWN", msg: "Unknown error" };
}
