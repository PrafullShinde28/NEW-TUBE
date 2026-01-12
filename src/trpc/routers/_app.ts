import { z } from "zod";
import { createTRPCRouter, baseProcedure } from "../init";


/**
 * Root tRPC router
 */
export const appRouter = createTRPCRouter({
  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query(({ input }) => {
      
      
      return {
        greeting: `hello ${input.text}`,
      };
    }),
});

/**
 * Export API type
 */
export type AppRouter = typeof appRouter;
