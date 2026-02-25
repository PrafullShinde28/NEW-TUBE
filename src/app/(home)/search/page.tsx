import { HydrateClient, trpc } from "@/trpc/server";
import { SearchView } from "@/modules/search/ui/view/search-view";
import { DEFAULT_LIMIT } from "@/constants";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    query?: string;
    categoryId?: string;
  }>;
}

const Page = async ({ searchParams }: PageProps) => {
  const params = await searchParams; // ✅ MUST await
  const { query, categoryId } = params;

  void trpc.categories.getMany.prefetch();

  void trpc.search.getMany.prefetchInfinite({
    query,
    categoryId,
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <SearchView query={query} categoryId={categoryId} />
    </HydrateClient>
  );
};

export default Page;