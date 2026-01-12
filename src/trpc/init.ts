import { cache } from "react";
import { initTRPC } from "@trpc/server";

/**
 * Create tRPC context (cached per request)
 */
export const createTRPCContext = cache(async () => {
  return {
    userId: "user_123",
  };
});

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * Initialize tRPC with context
 */
const t = initTRPC.context<Context>().create();

/**
 * Export helpers
 */
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
