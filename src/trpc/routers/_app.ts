import { categoriesRouter } from "@/modules/categories/server/procedures";
import {  createTRPCRouter } from "../init";
import { studioRouter } from "@/modules/studio/server/procedures";
import { videosRouter } from "@/modules/videos/server/procedures";
import { videoViewsRouter } from "@/modules/video-views/server/procedure";


/**
 * Root tRPC router
 */
export const appRouter = createTRPCRouter({
   studio: studioRouter,
   videos : videosRouter,
   categories : categoriesRouter,
   videoViews : videoViewsRouter,

});

/**
 * Export API type
 */
export type AppRouter = typeof appRouter;
