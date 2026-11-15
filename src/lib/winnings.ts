// Converts the API's winnings into what the win rows and the claim pop-up display.

import type { Entry } from "@/data/entries";
import type { ApiWinning, WinStatus } from "@/lib/api";
import { toListing } from "@/lib/listings";

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

export type Win = Entry & {
  claimStatus: WinStatus;
  /** The claim window passed without a claim. */
  expired: boolean;
  /** e.g. "#10393" */
  winningEntry: string;
  /** e.g. "2026 Honda Civic" */
  vehicle: string;
  /** e.g. "Aug 27, 2026" */
  claimDeadline: string;
  /** Why staff asked for new documents, if they did. */
  documentsRequest?: string;
  listingId?: string;
  image?: string;
};

/** "Aug 27, 2026" */
function formatDate(date: Date) {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function calendarDaysBetween(earlier: Date, later: Date) {
  const start = new Date(earlier).setHours(0, 0, 0, 0);
  const end = new Date(later).setHours(0, 0, 0, 0);
  return Math.round((end - start) / DAY_MS);
}

export function toWin(api: ApiWinning, now = Date.now()): Win {
  const listing = api.listing && toListing(api.listing, now);
  const title = api.listing?.title ?? "Prize";
  const year = api.listing?.year;
  // Some titles already start with the year.
  const vehicle =
    year && !title.startsWith(String(year)) ? `${year} ${title}` : title;
  const done = ["delivered", "forfeited"].includes(api.status) || api.expired;

  return {
    id: api.id,
    title: vehicle,
    entries: api.quantity,
    status: done ? "completed" : "active",
    category: listing?.category ?? "cars",
    brand: listing?.brand ?? "",
    voucherPrice: listing?.voucherPrice ?? 0,
    assetValue: listing?.assetValue ?? 0,
    won: true,
    enteredDaysAgo: Math.max(
      0,
      calendarDaysBetween(new Date(api.selectedAt), new Date(now)),
    ),
    claimStatus: api.status,
    expired: api.expired,
    winningEntry: `#${api.winningTicketNumber}`,
    vehicle,
    claimDeadline: formatDate(new Date(api.claimDeadline)),
    documentsRequest: api.documentsRequestReason ?? undefined,
    listingId: api.listing?.id,
    image: api.listing?.images[0],
  };
}
