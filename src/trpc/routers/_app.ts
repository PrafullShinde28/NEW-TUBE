import { categoriesRouter } from "@/modules/categories/server/procedures";
import {  createTRPCRouter } from "../init";
import { studioRouter } from "@/modules/studio/server/procedures";
import { videosRouter } from "@/modules/videos/server/procedures";
import { videoViewsRouter } from "@/modules/video-views/server/procedure";
import { videoReactionsRouter } from "@/modules/video-reactions/server/procedure";
import { subscriptionsRouter } from "@/modules/subscriptions/servers/procedure"; 
import { commentsRouter } from "@/modules/comments/server/procedure";
import { commentReactionsRouter } from "@/modules/comment-reactions/server/procedure";
import { suggestionRouter } from "@/modules/suggestions/server/procedure";
import { searchRouter } from "@/modules/search/server/procedure";
import { playlistRouter } from "@/modules/playlists/server/procedures";

/**
 * Root tRPC router
 */
export const appRouter = createTRPCRouter({
   studio: studioRouter,
   videos : videosRouter,
   search : searchRouter,
   comments : commentsRouter,
   playlists : playlistRouter,
   categories : categoriesRouter,
   videoViews : videoViewsRouter,
   subscriptions : subscriptionsRouter ,
   videoReactions : videoReactionsRouter,
   commentReactions : commentReactionsRouter,
   suggestions : suggestionRouter,
 
   
});

/**
 * Export API type
 */
export type AppRouter = typeof appRouter;
