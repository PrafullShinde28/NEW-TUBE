import { formatDistanceToNow } from "date-fns";
import { VideoGetManyOutput } from "../../types";
import { useMemo } from "react";
import Link from "next/link";
import { UserAvatar } from "@/components/user-avatar";
import { VideoMenu } from "./video-menu";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoInfoProps {
  data: VideoGetManyOutput["items"][number];
  onRemove?: () => void;
}

export const VideoInfoSkeleton = () => {
  return (
    <div className="flex gap-3 w-full">
      {/* Avatar */}
      <Skeleton className="size-9 rounded-full flex-shrink-0 mt-1" />

      {/* Right Content */}
      <div className="flex flex-1 min-w-0">
        <div className="flex flex-col flex-1 min-w-0 space-y-1">
          <Skeleton className="h-4 w-[85%]" />
          <Skeleton className="h-3 w-[60%]" />
          <Skeleton className="h-3 w-[40%]" />
        </div>

        {/* Menu Placeholder */}
        <Skeleton className="h-5 w-5 ml-2 rounded-sm flex-shrink-0" />
      </div>
    </div>
  );
};


export const VideoInfo = ({ data, onRemove }: VideoInfoProps) => {
  const compactViews = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(data.viewCount);
  }, [data.viewCount]);

  const compactDate = useMemo(() => {
    return formatDistanceToNow(data.createdAt, {
      addSuffix: true,
    });
  }, [data.createdAt]);

  return (
    <div className="flex gap-3 w-full">
      {/* Avatar */}
      <Link
        href={`/users/${data.userId}`}
        className="flex-shrink-0 mt-1"
      >
        <UserAvatar
          imageUrl={data.user.imageUrl}
          name={data.user.name}
        />
      </Link>

      {/* Right Section */}
      <div className="flex flex-1 min-w-0">
        <div className="flex flex-col flex-1 min-w-0">
          {/* Title */}
          <Link href={`/videos/${data.id}`}>
            <h3 className="text-sm font-medium leading-[1.2] line-clamp-2">
              {data.title}
            </h3>
          </Link>

          {/* Author */}
          <Link href={`/users/${data.user.id}`}>
            <span className="text-xs text-muted-foreground leading-[1.2]">
              {data.user.name}
            </span>
          </Link>

          {/* Views + Date */}
          <span className="text-xs text-muted-foreground leading-[1.2]">
            {compactViews} views • {compactDate}
          </span>
        </div>

        {/* 3 Dot Menu */}
        <div className="flex-shrink-0 ml-2">
          <VideoMenu
            videoId={data.id}
            onRemove={onRemove}
          />
        </div>
      </div>
    </div>
  );
};