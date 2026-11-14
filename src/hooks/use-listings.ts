

import { useCallback, useEffect, useRef, useState } from "react";

import type { Listing } from "@/data/listings";
import { ApiError, getListings } from "@/lib/api";
import { toListing } from "@/lib/listings";

const PAGE_SIZE = 24;

type Status = "loading" | "ready" | "error";

/** Live listings from the API, loaded a page at a time. */
export function useListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<ApiError | null>(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Bumped by every first-page load; responses from an older load are ignored.
  const generation = useRef(0);

  /** Loads page 1, replacing what's shown. Resolves false if it failed. */
  const loadFirstPage = useCallback(async (mode: "initial" | "refresh") => {
    const current = ++generation.current;
    if (mode === "refresh") setRefreshing(true);
    else setStatus("loading");

    try {
      const result = await getListings(1, PAGE_SIZE);
      if (current !== generation.current) return true;
      setListings(result.listings.map((api) => toListing(api)));
      setPage(result.page);
      setPages(result.pages);
      setError(null);
      setStatus("ready");
      return true;
    } catch (e) {
      if (current !== generation.current) return true;
      setError(e instanceof ApiError ? e : null);
      // A failed refresh keeps the listings already on screen.
      if (mode === "initial") setStatus("error");
      return false;
    } finally {
      if (current === generation.current) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadFirstPage("initial");
  }, [loadFirstPage]);

  /** Appends the next page, if there is one. */
  const loadMore = useCallback(async () => {
    if (status !== "ready" || loadingMore || refreshing || page >= pages)
      return;
    const current = generation.current;
    setLoadingMore(true);
    try {
      const result = await getListings(page + 1, PAGE_SIZE);
      if (current !== generation.current) return;
      setListings((previous) => {
        const seen = new Set(previous.map((l) => l.id));
        return [
          ...previous,
          ...result.listings
            .filter((api) => !seen.has(api.id))
            .map((api) => toListing(api)),
        ];
      });
      setPage(result.page);
      setPages(result.pages);
    } catch {
      // Scrolling to the end again retries.
    } finally {
      setLoadingMore(false);
    }
  }, [status, loadingMore, refreshing, page, pages]);

  return {
    listings,
    status,
    error,
    refreshing,
    loadingMore,
    refresh: () => loadFirstPage("refresh"),
    retry: () => loadFirstPage("initial"),
    loadMore,
  };
}
