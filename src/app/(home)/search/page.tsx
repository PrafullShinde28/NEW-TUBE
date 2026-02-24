import { HydrateClient, trpc } from "@/trpc/server";
import { SearchView } from "@/modules/search/ui/view/search-view";
import { DEFAULT_ECDH_CURVE } from "node:tls";
import { DEFAULT_LIMIT } from "@/constants";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: {
    query: string | undefined;
    categoryId: string | undefined;
  };
}

const Page = async ({ searchParams }: PageProps) => {
  const { query, categoryId } = searchParams;

  void trpc.categories.getMany.prefetch();
  void trpc.search.getMany.prefetchInfinite({
    query,
    categoryId,
    limit : DEFAULT_LIMIT,
  });


  return (
    <HydrateClient>
      <SearchView query={query} categoryId={categoryId}/>
    </HydrateClient>
  );
};

export default Page;