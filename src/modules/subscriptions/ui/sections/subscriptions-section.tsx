"use client"
import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import {  VideoGridCardSkeleton } from "@/modules/videos/ui/components/video-grid-card";
import { VideoRowCardSkeleton } from "@/modules/videos/ui/components/video-row-card";
import { trpc } from "@/trpc/client";
import Link from "next/link";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";
import { SubscriptionItem, SubscriptionItemSkeleton } from "../components/subscription-item";



export const SubscriptionsSection=()=>{
    return(
        <Suspense fallback={<SubscriptionsSectionSkeleton/>}>
            <ErrorBoundary fallback={<p>Error...</p>}>
                <SubscriptionsSectionSuspense />
            </ErrorBoundary>
        </Suspense>
    )
}

const SubscriptionsSectionSkeleton =()=>{
    return(
        
                <div className="flex flex-col gap-4 ">
                {Array.from({length:18}).map((_,index)=>(
                    <SubscriptionItemSkeleton key={index}/>
                ))}
                </div>
    )
}

const SubscriptionsSectionSuspense =()=>{
    const utils = trpc.useUtils();
    const [subscriptions,query] = trpc.subscriptions.getMany.useSuspenseInfiniteQuery(
        {limit:DEFAULT_LIMIT},
        {
            getNextPageParam:(lastPage)=>lastPage.nextCursor,
        }
    );

const unSubscribe = trpc.subscriptions.remove.useMutation({
        onSuccess : (data)=>{
            toast.success("Unsubscribed");
            utils.subscriptions.getMany.invalidate();
            utils.videos.getManySubscribed.invalidate();
            utils.users.getOne.invalidate({id:data.creatorId});

        },
        onError : (error)=>{
             toast.error("Something went wrong");
        }
    });

  
    return(
        <div>
            <div className="flex flex-col gap-4 ">
                {subscriptions.pages.flatMap((page)=>page.items)
                        .map((subscription)=>(
                           <Link
                           key={subscription.creatorId}  
                           href={`/user/${subscription.user.id}`}
                            >
                            <SubscriptionItem
                             name={subscription.user.name}
                             imageUrl={subscription.user.imageUrl}
                             subscriberCount={subscription.user.subscriberCount}
                             onUnsubscribe={()=>{
                                unSubscribe.mutate({userId:subscription.creatorId})
                             }}
                             disabled={unSubscribe.isPending}
                            />
                           </Link>
                        ))
                }
            </div>
            
            <InfiniteScroll
            hasNextPage={query.hasNextPage}
            isFetchingNextPage={query.isFetchingNextPage}
            fetchNextPage={query.fetchNextPage}
            />
           
        </div>
    )
};


