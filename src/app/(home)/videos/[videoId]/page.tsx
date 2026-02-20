// import { VideoView } from "@/modules/videos/ui/views/video-view";

// import { HydrateClient, trpc } from "@/trpc/server";

// interface PageProps {
//     params : Promise<{
//         videoId : string;
//     }>;
// }
// const Page = async ({params}:PageProps) =>{
//     const {videoId} = await params;

//     void trpc.videos.getOne.prefetch({id:videoId});
//     //TODO : don't forget to change to 'prefetchInfinite'p
//     void trpc.comments.getMany.prefetch({videoId:videoId})


//     return(
//         <HydrateClient>
//             <VideoView
//             videoId={videoId}
//             />
//         </HydrateClient>
//     )
// }

// export default Page;
import { VideoView } from "@/modules/videos/ui/views/video-view";
import { HydrateClient, trpc } from "@/trpc/server";

interface PageProps {
    params: Promise<{
        videoId: string;
    }>;
}

const Page = async ({ params }: PageProps) => {
    const { videoId } = await params;

    // run parallel on server
    await Promise.all([
        trpc.videos.getOne.prefetch({ id: videoId }),
        trpc.comments.getMany.prefetchInfinite({ videoId }),
        
    ]);

    return (
        <HydrateClient>
            <VideoView videoId={videoId} />
        </HydrateClient>
    );
};

export default Page;