import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";
import { useState } from "react";

import type { Listing } from "@/data/listings";
import {
  ApiError,
  getListing,
  getListings,
  getMyListingEntries,
  setListingSaved,
  type ApiListing,
  type ListingsPage,
} from "@/lib/api";
import { toListing } from "@/lib/listings";

const PAGE_SIZE = 24;

export const listingKeys = {
  all: ["listings"] as const,
  one: (id: string) => ["listing", id] as const,
};

type Status = "loading" | "ready" | "error";

function toListings(data: InfiniteData<ListingsPage>): Listing[] {
  const now = Date.now();
  const seen = new Set<string>();
  const listings: Listing[] = [];
  for (const page of data.pages) {
    for (const api of page.listings) {
      if (seen.has(api.id)) continue; // a listing can shift pages between loads
      seen.add(api.id);
      listings.push(toListing(api, now));
    }
  }
  return listings;
}

/** Live listings from the API, loaded a page at a time and shared by every screen. */
export function useListings() {
  const query = useInfiniteQuery({
    queryKey: listingKeys.all,
    queryFn: ({ pageParam }) => getListings(pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page < last.pages ? last.page + 1 : undefined,
    select: toListings,
  });

  // Only true for pull to refresh, not background refetches.
  const [refreshing, setRefreshing] = useState(false);

  /** Reloads every loaded page. Resolves false if it failed. */
  const refresh = async () => {
    setRefreshing(true);
    try {
      const result = await query.refetch();
      return !result.isError;
    } finally {
      setRefreshing(false);
    }
  };

  const status: Status = query.data
    ? "ready"
    : query.isError && !query.isFetching
      ? "error"
      : "loading";

  return {
    listings: query.data ?? [],
    status,
    error: query.error instanceof ApiError ? query.error : null,
    refreshing,
    loadingMore: query.isFetchingNextPage,
    refresh,
    retry: () => query.refetch(),
    loadMore: () => {
      if (query.hasNextPage && !query.isFetching) query.fetchNextPage();
    },
  };
}

function fromListingsCache(queryClient: QueryClient, id: string) {
  return queryClient
    .getQueryData<InfiniteData<ListingsPage>>(listingKeys.all)
    ?.pages.flatMap((page) => page.listings)
    .find((listing) => listing.id === id);
}

const selectListing = (api: ApiListing) => toListing(api);

/** One listing. Shows the copy already in the listings cache while it loads. */
export function useListing(id: string, enabled = true) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: listingKeys.one(id),
    queryFn: async () => (await getListing(id)).listing,
    enabled,
    placeholderData: () => fromListingsCache(queryClient, id),
    select: selectListing,
  });
}

/** Saves or unsaves a listing, updating the screen before the server answers. */
export function useSaveListing(id: string) {
  const queryClient = useQueryClient();
  const key = listingKeys.one(id);

  return useMutation({
    mutationFn: (saved: boolean) => setListingSaved(id, saved),
    onMutate: async (saved) => {
      // Stop a refetch in flight from overwriting the change.
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<ApiListing>(key);
      queryClient.setQueryData<ApiListing>(
        key,
        (old) => old && { ...old, savedByMe: saved },
      );
      return { previous };
    },
    onError: (_error, _saved, context) => {
      queryClient.setQueryData(key, context?.previous);
    },
    onSuccess: ({ saved }) => {
      queryClient.setQueryData<ApiListing>(
        key,
        (old) => old && { ...old, savedByMe: saved },
      );
    },
  });
}

/** The signed-in user's tickets on a listing, and the winner once drawn. */
export function useMyTickets(listingId: string, enabled = true) {
  return useQuery({
    queryKey: [...listingKeys.one(listingId), "entries"],
    queryFn: () => getMyListingEntries(listingId),
    enabled,
  });
}
