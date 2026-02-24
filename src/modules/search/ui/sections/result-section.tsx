"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import { VideoGridCard } from "@/modules/videos/ui/components/video-grid-card";
import { VideoRowCard } from "@/modules/videos/ui/components/video-row-card";
import { trpc } from "@/trpc/client";

interface ResultSectionProps {
  query: string | undefined;
  categoryId: string | undefined;
}

export const ResultSection = ({
  query,
  categoryId,
}: ResultSectionProps) => {
  const isMobile = useIsMobile();

  const [result , resultQuery] = trpc.search.getMany.useSuspenseInfiniteQuery(
    {
      query,
      categoryId,
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <>
      {isMobile ? (
        <div className="flex flex-col gap-4 gap-y-10">
          {result.pages
            .flatMap((page) => page.items)
            .map((video) => (
              <VideoGridCard key={video.id} data={video} />
            ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {result.pages
            .flatMap((page) => page.items)
            .map((video) => (
              <VideoRowCard key={video.id} data={video} />
            ))}
        </div>
      )}
      <InfiniteScroll 
      hasNextPage={resultQuery.hasNextPage}
      isFetchingNextPage = {resultQuery.isFetchingNextPage}
      fetchNextPage={resultQuery.fetchNextPage}
      />
    </>
  );
};