"use client";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import{
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,

}from "@/components/ui/table"
import Link from "next/link";

export const VideoSection=()=>{
    return(
        <Suspense fallback={<p>Loading...</p>}>
            <ErrorBoundary fallback={<p>Error...</p>}>
                <VideoSectionSuspense/>
            </ErrorBoundary>
        </Suspense>
    )
}

export const VideoSectionSuspense = ()=>{
    const [videos,query] = trpc.studio.getMany.useSuspenseInfiniteQuery({
        limit : DEFAULT_LIMIT,
    },{
        getNextPageParam : (lastPage)=>lastPage.nextCursor,
    });

    return(
        <div>
            <div className="border-y">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="pl-6 w-[510px]">Video</TableHead>
                            <TableHead>Visibility</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Views</TableHead>
                            <TableHead className="text-right">Comments</TableHead>
                            <TableHead className="text-right pr-6">Likes</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                    {videos.pages.flatMap((page)=>page.items).map((video)=>(
                        <Link href={`/studio/videos/${video.id}`} key={video.id} legacyBehavior>
                            <TableRow key={video.id} className="hover:bg-muted/50">
                                 <TableCell className="pl-6 w-[510px] font-medium">
                                    <Link
                                        href={`/studio/videos/${video.id}`}
                                        className="block w-full"
                                    >
                                        {video.title}
                                    </Link>
                                </TableCell>

                                <TableCell>visibility</TableCell>
                                <TableCell>status</TableCell>
                                <TableCell>date</TableCell>

                                <TableCell className="text-right">views</TableCell>
                                <TableCell className="text-right">comments</TableCell>
                                <TableCell className="text-right pr-6">likes</TableCell>
                            </TableRow>
                                    </Link>
                                ))}
                    </TableBody>
                </Table>
            </div>
      
           <InfiniteScroll
                isManual
                hasNextPage={query.hasNextPage}
                isFetchingNextPage={query.isFetchingNextPage}
                fetchNextPage={query.fetchNextPage}

           />
        </div>
    )
}