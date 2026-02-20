"use client";

import { mux } from "@/lib/mux";
import MuxPlayer from "@mux/mux-player-react";

interface VideoPlayerProps {
  playbackId?: string | null;
  thumbnailUrl?: string | null;
  status?: "waiting" | "processing" | "ready" | string;
  autoplay?: boolean;
  onPlay?: () => void;
}

export const VideoPlayerSkeleton = ()=>{
  return <div className="aspect-video bg-black rounded-xl"/>
};


export const VideoPlayer = ({
  playbackId,
  thumbnailUrl,
  status,
  autoplay = false,
  onPlay,
}: VideoPlayerProps) => {
  if (!playbackId) return null;
  return (
    <div className="relative w-full h-full">
      <MuxPlayer
        playbackId={playbackId}
        poster={status === "ready" ? thumbnailUrl ?? undefined : undefined}
        playerInitTime={0}
        autoPlay={autoplay}
        thumbnailTime={0}
        accentColor="#FF2056"
        onPlay={onPlay}
        className="w-full h-full object-contain"
      />

      {status !== "ready" && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <p className="text-white text-sm">Processing video…</p>
        </div>
      )}
    </div>
  );
};
