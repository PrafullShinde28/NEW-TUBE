import { createTRPCRouter,protectedProcedure } from "@/trpc/init";
import {z} from "zod"
import { db } from "@/db";
import { commentReactions, videoReactions } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { use } from "react";
import { comment } from "postcss";

export const commentReactionsRouter = createTRPCRouter({
    like : protectedProcedure
                    .input(z.object({commentId:z.string().uuid() }))
                    .mutation(async({input,ctx})=>{
                        const {id:userId} = ctx.user;
                        const {commentId} = input;
                        const [existingCommentReaction] = await db
                                                    .select()
                                                    .from(commentReactions)
                                                    .where(
                                                        and(
                                                            eq(commentReactions.commentId,commentId),
                                                            eq(commentReactions.userId,userId),
                                                            eq(commentReactions.type,"like")
                                                        )
                                                    );
                        if(existingCommentReaction){
                            const [deletedCommentReaction] = await db
                                                                  .delete(commentReactions)
                                                                  .where(
                                                                    and(
                                                                        eq(commentReactions.userId,userId),
                                                                        eq(commentReactions.commentId,commentId)

                                                                    )
                                                                  ).returning();

                                                        return deletedCommentReaction;
                                                   }
                    
                        const [createCommentReaction] = await db
                                                        .insert(commentReactions)
                                                        .values({userId,commentId , type : "like"})
                                                        .onConflictDoUpdate({
                                                            target : [commentReactions.userId,commentReactions.commentId],
                                                            set :{
                                                                type:"like"
                                                            },
                                                        })
                                                        .returning();

                                    return createCommentReaction;
                    }),

                 dislike : protectedProcedure
                    .input(z.object({commentId:z.string().uuid() }))
                    .mutation(async({input,ctx})=>{
                        const {id:userId} = ctx.user;
                        const {commentId} = input;
                        const [existingCommentReactionDislike] = await db
                                                    .select()
                                                    .from(commentReactions)
                                                    .where(
                                                        and(
                                                            eq(commentReactions.commentId,commentId),
                                                            eq(commentReactions.userId,userId),
                                                            eq(commentReactions.type,"dislike")
                                                        )
                                                    );
                        if(existingCommentReactionDislike){
                            const [deletedCommentReaction] = await db
                                                                  .delete(commentReactions)
                                                                  .where(
                                                                    and(
                                                                        eq(commentReactions.userId,userId),
                                                                        eq(commentReactions.commentId,commentId)

                                                                    )
                                                                  ).returning();

                                                        return deletedCommentReaction;
                                                   }
                    
                        const [createCommentReaction] = await db
                                                        .insert(commentReactions)
                                                        .values({userId,commentId , type : "dislike"})
                                                        .onConflictDoUpdate({
                                                            target : [commentReactions.userId,commentReactions.commentId],
                                                            set :{
                                                                type:"dislike"
                                                            },
                                                        })
                                                        .returning();

                                    return createCommentReaction;
                    })
        })