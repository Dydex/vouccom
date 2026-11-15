import { useQuery } from "@tanstack/react-query";

import type { Draw, DrawListItem } from "@/data/draws";
import { entriesKey } from "@/hooks/use-entries";
import { getListings, getMyEntries, type MyEntry } from "@/lib/api";
import { toDrawItem, toMyDraw } from "@/lib/draws";

const DRAWS_LIMIT = 60;

function toMyDraws(data: { entries: MyEntry[] }): Draw[] {
  const now = Date.now();
  return data.entries
    .map((entry) => toMyDraw(entry, now))
    .filter((draw): draw is Draw => draw !== null)
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

/** Draws the user has entered that haven't happened yet, soonest first. */
export function useMyDraws() {
  // Shares the entries cache with My Entries and Home.
  return useQuery({
    queryKey: entriesKey,
    queryFn: getMyEntries,
    select: toMyDraws,
  });
}

/** Every draw: live listings, then closed ones. */
export function useAllDraws() {
  const live = useQuery({
    queryKey: ["draws", "live"],
    queryFn: () => getListings(1, DRAWS_LIMIT, "live"),
  });
  const closed = useQuery({
    queryKey: ["draws", "closed"],
    queryFn: () => getListings(1, DRAWS_LIMIT, "closed"),
  });

  const now = Date.now();
  const draws: DrawListItem[] | undefined =
    live.data && closed.data
      ? [...live.data.listings, ...closed.data.listings].map((api) =>
          toDrawItem(api, now),
        )
      : undefined;

  return {
    draws,
    isPending: live.isPending || closed.isPending,
    error: live.error ?? closed.error,
    refetch: () => Promise.all([live.refetch(), closed.refetch()]),
  };
}
