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
