import { baseProcedure, createTRPCRouter,protectedProcedure } from "@/trpc/init";
import {z} from "zod"
import { db } from "@/db";
import { commentInsertSchema, comments, users } from "@/db/schema";
import { and, eq, getTableColumns } from "drizzle-orm";


export const commentsRouter = createTRPCRouter({
    create : protectedProcedure
                    .input(z.object(
                        {
                        videoId : z.string().uuid(),
                        value : z.string(),
                    }))
                    .mutation(async({input,ctx})=>{
                        const {id:userId} = ctx.user;
                        const {videoId,value} = input;
                        const [createdComments] = await db
                                                    .insert(comments)
                                                    .values({userId,videoId,value})
                                                    .returning();
                                                    

                          return createdComments;
                    }),
    getMany : baseProcedure
                    .input(
                        z.object({
                            videoId : z.string().uuid(),
                        })
                    )
                    .query(async ({input})=>{
                        const {videoId} = input;
                        const data = await db
                                            .select({
                                             ...getTableColumns(comments),
                                             user : users,
                                            })
                                            .from(comments)
                                            .where(eq(comments.videoId,videoId))
                                            .innerJoin(users,eq(comments.userId,users.id))
                        return data;
                    })
})