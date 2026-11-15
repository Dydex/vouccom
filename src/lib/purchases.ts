// Converts purchases into activity rows and receipts into transaction details.

import type { Activity } from "@/data/draws";
import type { Transaction, TransactionStatus } from "@/data/wallet";
import type { ApiPurchase, ApiReceipt, PurchaseStatus } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import { fullDateTime, relativeTime } from "@/lib/wallet";

const STATUSES: Record<PurchaseStatus, TransactionStatus> = {
  succeeded: "successful",
  pending: "pending",
  failed: "failed",
  refunded: "refunded",
};

function vouchers(qty: number) {
  return `${qty} ${qty === 1 ? "voucher" : "vouchers"}`;
}

function titleFor(api: ApiPurchase) {
  switch (api.status) {
    case "pending":
      return `Buying ${vouchers(api.qty)}`;
    case "failed":
      return `Purchase of ${vouchers(api.qty)} failed`;
    case "refunded":
      return `Refunded ${vouchers(api.qty)}`;
    default:
      return `Purchased ${vouchers(api.qty)}`;
  }
}

/** A row in Recent activity. */
export function toActivity(api: ApiPurchase, now = new Date()): Activity {
  return {
    id: `${api.kind}-${api.id}`,
    kind: "purchase",
    title: titleFor(api),
    subtitle: api.asset,
    time: timeAgo(new Date(api.date), now),
    purchase: { kind: api.kind, id: api.id },
  };
}

/** What the receipt pop-up can show before the full receipt loads. */
export function purchaseTransaction(
  api: ApiPurchase,
  now = new Date(),
): Transaction {
  const date = new Date(api.date);
  return {
    id: `${api.kind}-${api.id}`,
    title: api.asset,
    time: relativeTime(date, now),
    amount: -api.amountKobo / 100,
    status: STATUSES[api.status],
    type: `Voucher Purchase · ${vouchers(api.qty)}`,
    method: "...",
    reference: "...",
    dateTime: fullDateTime(date),
  };
}

/** The full receipt, for the Transaction details pop-up. */
export function receiptTransaction(
  receipt: ApiReceipt,
  now = new Date(),
): Transaction {
  const date = new Date(receipt.date);
  const qty = receipt.items.reduce((sum, item) => sum + item.quantity, 0);
  const tickets = receipt.items
    .filter((item) => item.ticketStart !== null && item.ticketEnd !== null)
    .map((item) => {
      const range =
        item.ticketStart === item.ticketEnd
          ? `#${item.ticketStart}`
          : `#${item.ticketStart} - #${item.ticketEnd}`;
      return receipt.items.length > 1 ? `${item.title}: ${range}` : range;
    })
    .join("\n");
  const { method, cardBrand, cardLast4 } = receipt.payment;

  return {
    id: `${receipt.kind}-${receipt.id}`,
    title:
      receipt.items.length === 1
        ? receipt.items[0].title
        : `${receipt.items.length} listings`,
    time: relativeTime(date, now),
    amount: -receipt.amountKobo / 100,
    status: STATUSES[receipt.status],
    type: `Voucher Purchase · ${vouchers(qty)}`,
    method:
      method === "wallet"
        ? "Wallet"
        : cardLast4
          ? `${cardBrand ?? "Card"} **** ${cardLast4}`
          : "Card",
    reference: receipt.reference,
    dateTime: fullDateTime(date),
    tickets: tickets || undefined,
  };
}
