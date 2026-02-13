export const runtime = "nodejs";

import { db } from "@/db";
import { serve } from "@upstash/workflow/nextjs";
import { videos } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { UTApi } from "uploadthing/server";

interface InputType {
  videoId: string;
  userId: string;
  prompt: string;
}

export const { POST } = serve(async (context) => {
  const { videoId, userId, prompt } = context.requestPayload as InputType;

  /* ---------------- STEP 1: GET VIDEO ---------------- */
  const video = await context.run("get-video", async () => {
    const [existingVideo] = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));

    if (!existingVideo) throw new Error("Video not found");

    return existingVideo;
  });

  /* ---------------- STEP 2: GENERATE + UPLOAD IMAGE ---------------- */
  const uploaded = await context.run("generate-and-upload-thumbnail", async () => {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_AI_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `${prompt}, youtube thumbnail, widescreen composition`,
          width: 1280,
          height: 720,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error("Cloudflare generation failed: " + err);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    /* upload immediately to avoid QStash 1MB limit */
    const utapi = new UTApi();

    const file = new File([buffer], "thumbnail.png", {
      type: "image/png",
    });

    const result = await utapi.uploadFiles([file]);

    if (!result[0].data) throw new Error("Upload failed");

    return {
      key: result[0].data.key,
      url: result[0].data.url,
    };
  });

  /* ---------------- STEP 3: DELETE OLD THUMBNAIL ---------------- */
  await context.run("clean-old-thumbnail", async () => {
    if (!video.thumbnailKey) return;

    const utapi = new UTApi();
    await utapi.deleteFiles(video.thumbnailKey);
  });

  /* ---------------- STEP 4: UPDATE DATABASE ---------------- */
  await context.run("update-video", async () => {
    await db
      .update(videos)
      .set({
        thumbnailKey: uploaded.key,
        thumbnailUrl: uploaded.url,
        updatedAt: new Date(),
      })
      .where(and(eq(videos.id, video.id), eq(videos.userId, video.userId)));
  });
});
