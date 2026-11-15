import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { SavedCard, Transaction } from "@/data/wallet";
import {
  getSavedCards,
  getWallet,
  removeSavedCard,
  type ApiSavedCard,
  type Wallet,
} from "@/lib/api";
import { toSavedCard, toTransaction } from "@/lib/wallet";

export const walletKey = ["wallet"] as const;
export const cardsKey = ["cards"] as const;

/** The wallet balance and recent activity. */
export function useWallet() {
  return useQuery({ queryKey: walletKey, queryFn: getWallet });
}

/** The balance in naira, or undefined while it loads. */
export function useWalletBalance() {
  const { data } = useWallet();
  return data && data.balanceKobo / 100;
}

function toTransactions(wallet: Wallet): Transaction[] {
  const now = new Date();
  return wallet.entries.map((activity) => toTransaction(activity, now));
}

/** Recent money in and out of the wallet. */
export function useWalletActivity() {
  return useQuery({
    queryKey: walletKey,
    queryFn: getWallet,
    select: toTransactions,
  });
}

function toSavedCards(data: { cards: ApiSavedCard[] }): SavedCard[] {
  return data.cards.map(toSavedCard);
}

/** Cards Paystack saved during card payments. */
export function useSavedCards() {
  return useQuery({
    queryKey: cardsKey,
    queryFn: getSavedCards,
    select: toSavedCards,
  });
}

export function useRemoveCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeSavedCard(id),
    onSuccess: (_result, id) => {
      queryClient.setQueryData<{ cards: ApiSavedCard[] }>(
        cardsKey,
        (old) => old && { cards: old.cards.filter((c) => c.id !== id) },
      );
    },
  });
}
