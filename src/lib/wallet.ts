// Converts the API's wallet activity and cards into the shapes the wallet screens display.

import type { CardBrand, SavedCard, Transaction } from "@/data/wallet";
import type { ApiSavedCard, WalletActivity } from "@/lib/api";

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const TITLES: Record<string, string> = {
  deposit: "Wallet top-up",
  voucher_purchase: "Voucher purchase",
  refund: "Refund",
};

/** "voucher_purchase" -> "Voucher purchase" for types we don't know yet. */
function titleFor(type: string) {
  const words = type.replace(/_/g, " ");
  return TITLES[type] ?? words.charAt(0).toUpperCase() + words.slice(1);
}

function clock(date: Date) {
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${String(hours % 12 || 12).padStart(2, "0")}:${minutes}`;
}

/** "Today 03:04pm", "Yesterday", "3 days ago" or "1 Sep". */
export function relativeTime(date: Date, now = new Date()) {
  const days = Math.round(
    (new Date(now).setHours(0, 0, 0, 0) - new Date(date).setHours(0, 0, 0, 0)) /
      DAY_MS,
  );
  if (days <= 0) {
    return `Today ${clock(date)}${date.getHours() < 12 ? "am" : "pm"}`;
  }
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

/** "01 Sep 2026, 10:42 AM" */
export function fullDateTime(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  return `${day} ${MONTHS[date.getMonth()]} ${date.getFullYear()}, ${clock(date)} ${date.getHours() < 12 ? "AM" : "PM"}`;
}

export function toTransaction(
  api: WalletActivity,
  now = new Date(),
): Transaction {
  const date = new Date(api.at);
  const title = titleFor(api.type);
  return {
    id: api.id,
    title,
    time: relativeTime(date, now),
    amount: api.amountKobo / 100,
    // Wallet activity only lists money that has moved.
    status: "successful",
    type: title,
    method: "Wallet",
    reference: api.id.slice(-8).toUpperCase(),
    dateTime: fullDateTime(date),
  };
}

function brandFor(cardType: string): CardBrand {
  const type = cardType.trim().toLowerCase();
  if (type.includes("visa")) return "VISA";
  if (type.includes("master")) return "Mastercard";
  return "Card";
}

export function toSavedCard(api: ApiSavedCard): SavedCard {
  const brand = brandFor(api.cardType);
  return {
    id: api.id,
    brand,
    // e.g. "Verve" when we have no logo for it.
    label:
      brand === "Card"
        ? api.cardType.trim().replace(/^\w/, (c) => c.toUpperCase())
        : brand,
    last4: api.last4,
    expires: `${api.expMonth.padStart(2, "0")}/${api.expYear.slice(-2)}`,
    bank: api.bank ?? undefined,
  };
}
