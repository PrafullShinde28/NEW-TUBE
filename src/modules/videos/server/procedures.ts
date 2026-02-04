import { videos, videoUpdateSchema } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { mux } from "@/lib/mux";
import { eq,and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const videosRouter = createTRPCRouter({
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
