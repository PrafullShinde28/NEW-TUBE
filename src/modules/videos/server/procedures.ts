import { videos, videoUpdateSchema } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { mux } from "@/lib/mux";
import { eq,and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { UTApi } from "uploadthing/server";
import { workflow } from "@/lib/workflow";

export const videosRouter = createTRPCRouter({
     generateDescription : protectedProcedure
  .input(z.object({ id: z.string().uuid() }))
  .mutation(async ({ ctx, input }) => {
    const { id: userId } = ctx.user;

    try {
      const result = await workflow.trigger({
        url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/description`,
        body: { userId, videoId: input.id },
      });

      return result.workflowRunId;

    } catch (err) {
      console.error("WORKFLOW FAILED:", err);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Workflow trigger failed",
      });
    }
  }),
    generateTitle : protectedProcedure
  .input(z.object({ id: z.string().uuid() }))
  .mutation(async ({ ctx, input }) => {
    const { id: userId } = ctx.user;

    try {
      const result = await workflow.trigger({
        url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/title`,
        body: { userId, videoId: input.id },
      });

      return result.workflowRunId;

    } catch (err) {
      console.error("WORKFLOW FAILED:", err);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Workflow trigger failed",
      });
    }
  }),
    generateThumbnail : protectedProcedure
  .input(z.object({ id: z.string().uuid() ,prompt: z.string().min(10), }))
  .mutation(async ({ ctx, input }) => {
    const { id: userId } = ctx.user;

    try {
      const result = await workflow.trigger({
        url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/thumbnail`,
        body: { userId, videoId: input.id , prompt : input.prompt },
      });

      return result.workflowRunId;

    } catch (err) {
      console.error("WORKFLOW FAILED:", err);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Workflow trigger failed",
      });
    }
  }),


     restoreThumbnail : protectedProcedure
    .input(  z.object({
        id : z.string().uuid(),
    }) )
    .mutation(async({input,ctx})=>{
        const {id : userId} = ctx.user;
        const [existingVideo] = await db.select().from(videos).where( and(
            eq(videos.id, input.id),
            eq(videos.userId,userId)
        ));  

        if(!existingVideo){
            throw new TRPCError({
                code : "NOT_FOUND",
            });
        }

        if(existingVideo.thumbnailKey){
            const utapi = new UTApi();
            await utapi.deleteFiles(existingVideo.thumbnailKey);
            await db.update(videos)
                    .set({
                      thumbnailKey : null,
                      thumbnailUrl : null,
                    })
                    .where( and(
                      eq(videos.id, input.id),
                      eq(videos.userId, userId)
                    ));
        }

        if(!existingVideo.muxPlaybackId){
            throw new TRPCError({
                code : "BAD_REQUEST",
                message : "Video does not have a Mux asset ID."
            });
        }

        const thumbnailUrl = `https://image.mux.com/${existingVideo.muxPlaybackId}/thumbnail.jpg`;
        const [updatedVideo] = await db
            .update(videos)
            .set({ thumbnailUrl })
            .where(and(
                eq(videos.id, input.id),
                eq(videos.userId, userId)
            ))
            .returning();
        
        return updatedVideo;
    }),

    
    remove : protectedProcedure
    .input(  z.object({
        id : z.string().uuid(),
    }) )
    .mutation(async({input,ctx})=>{
        const {id : userId} = ctx.user;
        const [removedVideo] = await db.delete(videos).where( and(
            eq(videos.id, input.id),
            eq(videos.userId,userId)
        )).returning();  

        if(!removedVideo){
            throw new TRPCError({
                code : "NOT_FOUND",
                message : "Video not found or you don't have permission to delete it."
            });
        }
        return removedVideo;
    }),
    update : protectedProcedure
    .input(videoUpdateSchema)
    .mutation(async({input,ctx})=>{
        const {id : userId} = ctx.user;
        if(!input.id){
            throw new TRPCError({
                code : "BAD_REQUEST",
                message : "Video ID is required for update."
            });
        }
        const [updatedVideo] = await db.update(videos).set({
            title : input.title,
            description : input.description,
            visibility : input.visibility,
            categoryId : input.categoryId,
            updatedAt : new Date(),
        }).where(and(
            eq(videos.id, input.id!),
            eq(videos.userId,userId)
        )).returning();

        if(!updatedVideo){
            throw new TRPCError({
                code : "NOT_FOUND",
                message : "Video not found or you don't have permission to update it."
            });
        }

        return updatedVideo;
    }),
    create : protectedProcedure.mutation(async({ctx})=>{
        const {id : userId} = ctx.user;

        const upload = await mux.video.uploads.create({
            new_asset_settings : {
                passthrough : userId,
                playback_policy : ["public"],
                input : [
                    {
                        generated_subtitles : [
                            {
                                language_code : "en",
                                name : "English"
                            },
                        ],
                    },
                ],

            },
            cors_origin : "*"
        });
            const [video] = await db
                                    .insert(videos)
                                    .values({
                                        userId,
                                        title : "Untitled",
                                        muxStatus : "waiting",
                                        muxUploadId : upload.id, 
                                    })
                                    .returning();

                    return {
                        video  :video,
                        url : upload.url,
                    }
        })
});
