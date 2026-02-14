import { VideoView } from "@/modules/studio/ui/views/video-view";
import { HydrateClient, trpc } from "@/trpc/server";

interface PageProps {
    params : Promise<{
        videoId : string;
    }>;
}
const Page = async ({params}:PageProps) =>{
    const {videoId} = await params;

    void trpc.videos.getOne.prefetch({id:videoId});


    return(
        <HydrateClient>
            <VideoView
            videoId={videoId}
            />
        </HydrateClient>
    )
}

export default Page;

import { VideoSection } from "@/modules/videos/ui/sections/video-section"

interface VideoViewsProps {
    videoId : string
}

export const VideoView = ({videoId} : VideoViewsProps)=>{
    return(
        <div className="flex flex-col max-w-[1700px] mx-auto pt-2.5 px-4 mb-10">
            <div className="flex flex-col xl:flex-row gap-6">
                <div className="flex-1 min-w-0">
                    <VideoSection videoId={videoId}/>
                </div>

            </div>
        </div>
    )
}

"use client"
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface VideoSectionProps {
    videoId : string;
}

export const VideoSection = ({videoId}:VideoSectionProps) =>{
    return(
        <Suspense fallback={<p>Loading...</p>}>
            <ErrorBoundary fallback={<p>Error</p>}>
                <VideoSectionSuspense videoId={videoId}/>
            </ErrorBoundary>
        </Suspense>
    )
};

const VideoSectionSuspense = ({videoId}:VideoSectionProps) =>{
    const [video] = trpc.videos.getOne.useSuspenseQuery({id:videoId})

    return(
        <div>
            {JSON.stringify(video)}
        </div>
    )
};