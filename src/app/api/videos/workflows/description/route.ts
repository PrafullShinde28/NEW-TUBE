export const runtime = "nodejs";

import { db } from "@/db";
import { serve } from "@upstash/workflow/nextjs";
import { videos } from "@/db/schema";
import { and, eq } from "drizzle-orm";

interface InputType {
  videoId: string;
  userId: string;
}

const DESCRIPTION_SYSTEM_PROMPT = `Your task is to summarize the transcript of a video. Please follow these guidelines:
- Be brief. Condense the content into a summary that captures the key points and main ideas without losing important details.
- Avoid jargon or overly complex language unless necessary for the context.
- Focus on the most critical information, ignoring filler, repetitive statements, or irrelevant tangents.
- ONLY return the summary, no other text, annotations, or comments.
- Aim for a summary that is 3-5 sentences long and no more than 200 characters.`;

export const { POST } = serve(async (context) => {
  const { videoId, userId } = context.requestPayload as InputType;

  /* ---------------- STEP 1: GET VIDEO ---------------- */
  const video = await context.run("get-video", async () => {
    const [existingVideo] = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));

    if (!existingVideo) throw new Error("Video not found");

    if (!existingVideo.muxPlaybackId || !existingVideo.muxTrackId)
      throw new Error("Mux subtitles not ready");

    return existingVideo;
  });

  /* ---------------- STEP 2: FETCH TRANSCRIPT FROM MUX ---------------- */
  const transcript = await context.run("get-transcript", async () => {
    const trackUrl = `https://stream.mux.com/${video.muxPlaybackId}/text/${video.muxTrackId}.vtt`;

    const response = await fetch(trackUrl);

    if (!response.ok) throw new Error("Failed to fetch transcript");

    const vtt = await response.text();

    // Clean subtitle timestamps & formatting
    const cleaned = vtt
      .replace(/WEBVTT/g, "")
      .replace(/\d{2}:\d{2}:\d{2}\.\d{3} --> .*?\n/g, "")
      .replace(/<[^>]*>/g, "") // remove tags
      .replace(/\n+/g, " ")
      .trim();

    // Cloudflare AI token safe size
    return cleaned.slice(0, 4000);
  });

  /* ---------------- STEP 3: GENERATE TITLE USING CLOUDFLARE AI ---------------- */
  const description = await context.run("generate-description", async () => {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/meta/llama-3-8b-instruct`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_AI_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                DESCRIPTION_SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: transcript,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error("Cloudflare AI request failed: " + err);
    }

    const data = await response.json();

    const generated = data?.result?.response?.trim();

    if (!generated) throw new Error("Cloudflare AI returned empty response");

    return generated;
  });

  /* ---------------- STEP 4: UPDATE DATABASE ---------------- */
  await context.run("update-video", async () => {
    await db
      .update(videos)
      .set({
        description: description || video.description,
        updatedAt: new Date(), // frontend polling detects change
      })
      .where(and(eq(videos.id, video.id), eq(videos.userId, video.userId)));
  });
});
