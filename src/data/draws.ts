import type { CategoryId } from "@/data/filters";
import type { PurchaseKind } from "@/lib/api";

export type Draw = {
  id: string;
  title: string;
  /** A live draw shows a play button instead of the date. */
  live?: boolean;
  category: CategoryId;
  brand: string;
  /** Price of one voucher, in naira */
  voucherPrice: number;
  /** Value of the prize, in naira */
  assetValue: number;
  drawDate: string;
  daysLeft: number;
  /** How many days ago the user entered. 0 = today. */
  enteredDaysAgo: number;
};

export type Activity = {
  id: string;
  kind: "purchase" | "saved" | "joined";
  title: string;
  subtitle: string;
  time: string;
  /** For purchases: what to load the receipt with. */
  purchase?: { kind: PurchaseKind; id: string };
};

// ---- The Draws tab: every draw, not just the user's own ----

export type DrawStatus = "live" | "upcoming" | "completed";

export type DrawListItem = {
  id: string;
  title: string;
  /** Extra assets in the same draw, shown as "+ 2 more". */
  extraAssets?: number;
  status: DrawStatus;
  /** Number of assets up for grabs */
  assets: number;
  /** The assets in this draw, for the details pop-up. */
  assetList: { title: string; listingId?: string }[];
  /** e.g. "24 Sep, 8PM" */
  drawDate: string;
  /** The winning entry of a completed draw. */
  winningEntry?: string;
  /** Where the draw is streamed. */
  link?: string;
  /** e.g. "24 Sep." */
  date: string;
  /** e.g. "12 hours left" or "2 days ago" */
  timeLabel: string;
  /** Days since the draw's date. 0 = today. */
  daysAgo: number;
  // What the Filters sheet filters on (taken from the first asset).
  category: CategoryId;
  brand: string;
  voucherPrice: number;
  assetValue: number;
};
