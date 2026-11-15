import { useQuery } from "@tanstack/react-query";

import type { Entry } from "@/data/entries";
import { getMyEntries, type MyEntry } from "@/lib/api";
import { toEntry } from "@/lib/entries";

export const entriesKey = ["entries"] as const;

function toEntries(data: { entries: MyEntry[] }): Entry[] {
  const now = Date.now();
  return data.entries.map((entry) => toEntry(entry, now));
}

/** Every listing the signed-in user has entered. */
export function useEntries() {
  return useQuery({
    queryKey: entriesKey,
    queryFn: getMyEntries,
    select: toEntries,
  });
}
