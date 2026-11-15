import {
  useInfiniteQuery,
  useQuery,
  type InfiniteData,
} from "@tanstack/react-query";

import {
  getPurchase,
  getPurchases,
  type ApiPurchase,
  type PurchaseKind,
  type PurchasesPage,
} from "@/lib/api";

const PAGE_SIZE = 20;

export const purchasesKey = ["purchases"] as const;

function allPurchases(data: InfiniteData<PurchasesPage>): ApiPurchase[] {
  const seen = new Set<string>();
  const purchases: ApiPurchase[] = [];
  for (const page of data.pages) {
    for (const purchase of page.purchases) {
      const key = `${purchase.kind}-${purchase.id}`;
      if (seen.has(key)) continue; // a new purchase shifts the pages
      seen.add(key);
      purchases.push(purchase);
    }
  }
  return purchases;
}

/** The purchase history, a page at a time. */
export function usePurchases() {
  return useInfiniteQuery({
    queryKey: purchasesKey,
    queryFn: ({ pageParam }) => getPurchases(pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page < last.pages ? last.page + 1 : undefined,
    select: allPurchases,
  });
}

/** One purchase's receipt. Only fetches while `enabled`. */
export function usePurchase(
  purchase: { kind: PurchaseKind; id: string } | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: [...purchasesKey, purchase?.kind, purchase?.id],
    queryFn: async () => {
      if (!purchase) throw new Error("No purchase");
      return (await getPurchase(purchase.kind, purchase.id)).purchase;
    },
    enabled: enabled && !!purchase,
  });
}
