import type { CategoryId } from "@/data/filters";

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

// TODO: replace with the user's draws from the backend.
export const DRAWS: Draw[] = [
  {
    id: "d1",
    title: "UK Used 2026 Toyota Tundra",
    live: true,
    category: "cars",
    brand: "Toyota",
    voucherPrice: 500,
    assetValue: 1_200_000,
    drawDate: "14 Sep",
    daysLeft: 0,
    enteredDaysAgo: 0,
  },
  {
    id: "d2",
    title: "UK Used 2026 Toyota Tundra",
    category: "cars",
    brand: "Toyota",
    voucherPrice: 500,
    assetValue: 1_200_000,
    drawDate: "14 Sep",
    daysLeft: 3,
    enteredDaysAgo: 0,
  },
];

export type Activity = {
  id: string;
  kind: "purchase" | "saved" | "joined";
  title: string;
  subtitle: string;
  time: string;
};

// TODO: replace with the user's recent activity from the backend.
const ACTIVITY_SAMPLES: Omit<Activity, "id">[] = [
  {
    kind: "purchase",
    title: "Purchased 5 vouchers",
    subtitle: "2026 Honda Civic",
    time: "2 hours ago",
  },
  {
    kind: "saved",
    title: "Saved a listing",
    subtitle: "2025 Toyota Corolla",
    time: "yesterday",
  },
  {
    kind: "joined",
    title: "Joined a draw",
    subtitle: "2020 Kia Rio",
    time: "3 days ago",
  },
];

export const ACTIVITY: Activity[] = Array.from({ length: 9 }, (_, i) => ({
  ...ACTIVITY_SAMPLES[i % ACTIVITY_SAMPLES.length],
  id: `a${i + 1}`,
}));

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

// TODO: replace with the draws from the backend.
export const ALL_DRAWS: DrawListItem[] = [
  {
    id: "ad1",
    title: "UK Used 2026 Honda Civic",
    extraAssets: 2,
    status: "live",
    assets: 3,
    assetList: [
      { title: "UK Used 2026 Honda Civic", listingId: "b3" },
      { title: "New 2026 Ford Bronco", listingId: "b2" },
      { title: "New 2025 Toyota Camry" },
    ],
    drawDate: "24 Sep, 8PM",
    link: "https://www.youtube.com",
    date: "24 Sep.",
    timeLabel: "12 hours left",
    daysAgo: 0,
    category: "cars",
    brand: "Honda",
    voucherPrice: 500,
    assetValue: 900_000,
  },
  {
    id: "ad2",
    title: "UK Used 2026 Honda Civic",
    status: "upcoming",
    assets: 1,
    assetList: [{ title: "UK Used 2026 Honda Civic", listingId: "b3" }],
    drawDate: "24 Sep, 8PM",
    link: "https://www.youtube.com",
    date: "24 Sep.",
    timeLabel: "12 hours left",
    daysAgo: 0,
    category: "cars",
    brand: "Honda",
    voucherPrice: 500,
    assetValue: 900_000,
  },
  {
    id: "ad3",
    title: "UK Used 2026 Honda Civic",
    status: "completed",
    assets: 1,
    assetList: [{ title: "UK Used 2026 Honda Civic", listingId: "b3" }],
    drawDate: "24 Sep, 8PM",
    winningEntry: "#10393",
    link: "https://www.youtube.com",
    date: "24 Sep.",
    timeLabel: "2 days ago",
    daysAgo: 0,
    category: "cars",
    brand: "Honda",
    voucherPrice: 500,
    assetValue: 900_000,
  },
];
