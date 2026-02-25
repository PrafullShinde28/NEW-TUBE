import Link from "next/link";
import { VideoGetManyOutput } from "../../types";
import {
  VideoThumbnail,
  VideoThumbnailSkeleton,
} from "./video-thumbnail";
import {
  VideoInfo,
  VideoInfoSkeleton,
} from "./video-info";

interface VideoGridCardProps {
  data: VideoGetManyOutput["items"][number];
  onRemove?: () => void;
}

export const VideoGridCardSkeleton = () => {
  return (
    <div className="flex flex-col w-full">
      <VideoThumbnailSkeleton />
      <div className="mt-3">
        <VideoInfoSkeleton />
      </div>
    </div>
  );
};

export const VideoGridCard = ({
  data,
  onRemove,
}: VideoGridCardProps) => {
  return (
    <div className="flex flex-col w-full group">
      <Link
        href={`/videos/${data.id}`}
        className="block transition-transform duration-200 group-hover:scale-[1.02]"
      >
        <VideoThumbnail
          imageUrl={data.thumbnailUrl}
          previewUrl={data.previewUrl}
          title={data.title}
          duration={data.duration}
        />
      </Link>

      <div className="mt-3">
        <VideoInfo data={data} onRemove={onRemove} />
      </div>
    </div>
  );
};