export const runtime = "nodejs";

import { db } from "@/db";
import { serve } from "@upstash/workflow/nextjs";
import { videos } from "@/db/schema";
import { and, eq } from "drizzle-orm";

interface InputType {
  videoId: string;
  userId: string;
}

export const { POST } = serve(async (context) => {
  const { videoId, userId } = context.requestPayload as InputType;

  // STEP 1 — Get video
  const video = await context.run("get-video", async () => {
    const [existingVideo] = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));

    if (!existingVideo) throw new Error("Video not found");

    return existingVideo;
  });

  // STEP 2 — Generate title
  const { body } = await context.api.openai.call("generate-title", {
    token: process.env.OPENAI_API_KEY!,
    operation: "chat.completions.create",
    body: {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Generate a short SEO friendly YouTube title (3-8 words). Return plain text only.",
        },
        {
          role: "user",
          content:
            "Hii everyone, in this tutorial we will learn how to build a YouTube clone",
        },
      ],
    },
  });

  const title = body.choices?.[0]?.message?.content?.trim();
  if (!title) throw new Error("AI did not return title");

  // STEP 3 — Update DB
  await context.run("update-video", async () => {
    await db
      .update(videos)
      .set({
        title,
        updatedAt: new Date(),
      })
      .where(and(eq(videos.id, video.id), eq(videos.userId, video.userId)));
  });

  // ❌ DO NOT return anything
});
