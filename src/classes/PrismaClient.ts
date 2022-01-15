import { PrismaClient } from "@prisma/client";
import { checkNodeEnv } from "../utils";

export const prisma = new PrismaClient({
  log: checkNodeEnv("production")
    ? ["warn", "error"]
    : ["info", "query", "warn", "error"],
});

export default prisma;
