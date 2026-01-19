import { categoriesRouter } from "@/modules/categories/server/procedures";
import {  createTRPCRouter } from "../init";


/**
 * Root tRPC router
 */
export const appRouter = createTRPCRouter({
  categories : categoriesRouter,
});

/**
 * Export API type
 */
export type AppRouter = typeof appRouter;
