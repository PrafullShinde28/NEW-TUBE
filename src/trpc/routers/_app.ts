import { categoriesRouter } from "@/modules/categories/server/procedures";
import {  createTRPCRouter } from "../init";
import { studioRouter } from "@/modules/studio/server/procedures";
import { videosRouter } from "@/modules/videos/server/procedures";

/**
 * Root tRPC router
 */
export const appRouter = createTRPCRouter({
  categories : categoriesRouter,
   studio: studioRouter,
   videos : videosRouter
});

/**
 * Export API type
 */
export type AppRouter = typeof appRouter;
