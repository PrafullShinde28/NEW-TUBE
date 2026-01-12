import { z } from "zod";
import {  createTRPCRouter, protectedProcedure } from "../init";


/**
 * Root tRPC router
 */
export const appRouter = createTRPCRouter({
  hello: protectedProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query(( opts ) => {
     console.log({dbUser : opts.ctx.user})
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
});

/**
 * Export API type
 */
export type AppRouter = typeof appRouter;
