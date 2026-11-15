import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { randomUUID } from "expo-crypto";
import { useRef } from "react";

import { entriesKey } from "@/hooks/use-entries";
import { cardsKey, walletKey } from "@/hooks/use-wallet";
import {
  ApiError,
  checkoutWithSavedCard,
  checkoutWithWallet,
  getCheckoutStatus,
  getTopUpStatus,
  startCardCheckout,
  startTopUp,
  type CartItem,
  type CheckoutStatus,
  type TopUpStatus,
  type Wallet,
} from "@/lib/api";

const POLL_EVERY_MS = 2_000;
const MAX_POLLS = 15;

/** Marks everything a purchase can change as out of date. */
export function refreshAfterPurchase(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: walletKey });
  queryClient.invalidateQueries({ queryKey: cardsKey });
  queryClient.invalidateQueries({ queryKey: entriesKey });
  // Every listing's tickets and sold count.
  queryClient.invalidateQueries({ queryKey: ["listing"] });
}

/**
 * One idempotency key per purchase. A retry of the same items after a network
 * error reuses it, so the server never charges twice.
 */
function useIdempotencyKey() {
  const attempt = useRef<{ body: string; key: string } | null>(null);

  return {
    keyFor(body: unknown) {
      const text = JSON.stringify(body);
      if (attempt.current?.body !== text) {
        attempt.current = { body: text, key: randomUUID() };
      }
      return attempt.current.key;
    },
    settled(error?: unknown) {
      // Keep the key only when there was no answer: that try may have gone through.
      if (!(error instanceof ApiError && error.status === 0)) {
        attempt.current = null;
      }
    },
  };
}

/** Pays for a cart from the wallet. */
export function useWalletCheckout() {
  const queryClient = useQueryClient();
  const idempotency = useIdempotencyKey();

  return useMutation({
    mutationFn: (items: CartItem[]) =>
      checkoutWithWallet(items, idempotency.keyFor(items)),
    onSuccess: (result) => {
      idempotency.settled();
      queryClient.setQueryData<Wallet>(
        walletKey,
        (old) => old && { ...old, balanceKobo: result.walletBalanceKobo },
      );
      refreshAfterPurchase(queryClient);
    },
    onError: (error) => idempotency.settled(error),
  });
}

/** Charges a saved card, with no Paystack page. */
export function useSavedCardCheckout() {
  const queryClient = useQueryClient();
  const idempotency = useIdempotencyKey();

  return useMutation({
    mutationFn: ({ items, cardId }: { items: CartItem[]; cardId: string }) =>
      checkoutWithSavedCard(
        items,
        cardId,
        idempotency.keyFor({ items, cardId }),
      ),
    onSuccess: () => {
      idempotency.settled();
      refreshAfterPurchase(queryClient);
    },
    onError: (error) => idempotency.settled(error),
  });
}

/** Starts a Paystack card payment and returns the page to open. */
export function useStartCardCheckout() {
  return useMutation({
    mutationFn: ({
      items,
      saveCard,
    }: {
      items: CartItem[];
      saveCard: boolean;
    }) => startCardCheckout(items, saveCard),
  });
}

/** Starts a Paystack top-up of `naira` and returns the page to open. */
export function useStartTopUp() {
  const idempotency = useIdempotencyKey();

  return useMutation({
    mutationFn: (naira: number) => {
      const amountKobo = Math.round(naira * 100);
      return startTopUp(amountKobo, idempotency.keyFor(amountKobo));
    },
    onSuccess: () => idempotency.settled(),
    onError: (error) => idempotency.settled(error),
  });
}

/** What the Paystack page was for. */
export type PaymentKind = "checkout" | "topup";

export type PaymentResult = {
  status: CheckoutStatus | TopUpStatus;
  amountKobo: number;
  /** Top-ups only. */
  walletBalanceKobo?: number;
};

/**
 * The result of a Paystack payment. With `poll`, checks again every 2s while
 * it's still pending, up to 15 times.
 */
export function usePaymentStatus(
  kind: PaymentKind,
  reference: string,
  { enabled, poll }: { enabled: boolean; poll: boolean },
) {
  return useQuery<PaymentResult>({
    queryKey: ["payment", kind, reference],
    queryFn: () =>
      kind === "topup"
        ? getTopUpStatus(reference)
        : getCheckoutStatus(reference),
    enabled,
    // Always ask the server: a cached "pending" is no use here.
    staleTime: 0,
    gcTime: 0,
    refetchInterval: (query) =>
      poll &&
      query.state.data?.status === "pending" &&
      query.state.dataUpdateCount < MAX_POLLS
        ? POLL_EVERY_MS
        : false,
  });
}
