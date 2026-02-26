import { DEFAULT_LIMIT } from "@/constants";
import { PlayliststView } from "@/modules/playlists/ui/views/playlists-view";
import { HydrateClient ,trpc} from "@/trpc/server";

const Page = async()=>{
    void trpc.playlists.getMany.prefetchInfinite({limit:DEFAULT_LIMIT});
    return (
        <HydrateClient>
          <PlayliststView/>
        </HydrateClient>
    )
}

export default Page;