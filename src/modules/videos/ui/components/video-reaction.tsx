import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils"
import { ThumbsUpIcon } from "lucide-react"


export const VideoReactions = ()=>{
    const viwerReaction : "like" | "dislike" ="like";

    return(
        <div className="flex items-center flex-none">
           <Button
           variant="secondary"
           className="rounded-tl-full rounded-r-none gap-2 pr-4"
           >
             <ThumbsUpIcon className={cn("size-5",viwerReaction ==="like" && "fill-black")} />
             {1}
           </Button>
         <Separator orientation="vertical" className="h-7"/>
           <Button
           variant="secondary"
           className="rounded-tl-none rounded-r-full pl-3"
           >
             <ThumbsUpIcon className={cn("size-5",viwerReaction !=="like" && "fill-black")} />
             {1}
           </Button>
        </div>
    )
}