import type { CategoryId } from "@/data/filters";

export type EntryStatus = "active" | "completed";

export type Entry = {
  id: string;
  title: string;
  /** Number of voucher entries the user holds in this draw */
  entries: number;
  status: EntryStatus;
  category: CategoryId;
  brand: string;
  /** Price of one voucher, in naira */
  voucherPrice: number;
  /** Value of the prize, in naira */
  assetValue: number;
  /** Days until the draw. Only meaningful while the entry is active. */
  daysLeft?: number;
  /** True when the user won this draw. */
  won?: boolean;
  /** How many days ago the user entered. 0 = today. */
  enteredDaysAgo: number;
};

// TODO: replace this sample data with the signed-in user's entries from the backend.
export const ENTRIES: Entry[] = [
  {
    id: "e1",
    title: "UK Used 2026 Toyota Tundra",
    entries: 5,
    status: "active",
    category: "cars",
    brand: "Toyota",
    voucherPrice: 500,
    assetValue: 1_200_000,
    daysLeft: 3,
    enteredDaysAgo: 0,
  },
  {
    id: "e2",
    title: "New 2026 Ford Bronco",
    entries: 5,
    status: "active",
    category: "cars",
    brand: "Ford",
    voucherPrice: 1000,
    assetValue: 2_100_000,
    daysLeft: 3,
    enteredDaysAgo: 0,
  },
  {
    id: "e3",
    title: "UK Used 2026 Honda Civic",
    entries: 45,
    status: "active",
    category: "cars",
    brand: "Honda",
    voucherPrice: 500,
    assetValue: 900_000,
    daysLeft: 3,
    enteredDaysAgo: 0,
  },
  {
    id: "e4",
    title: "UK Used 2026 Toyota Tundra",
    entries: 5,
    status: "active",
    category: "cars",
    brand: "Toyota",
    voucherPrice: 2000,
    assetValue: 1_500_000,
    daysLeft: 3,
    enteredDaysAgo: 0,
  },
  {
    id: "e5",
    title: "UK Used 2026 Honda Civic",
    entries: 5,
    status: "completed",
    category: "cars",
    brand: "Honda",
    voucherPrice: 1000,
    assetValue: 900_000,
    enteredDaysAgo: 0,
  },
];

export function entryMeta(entry: Entry): string {
  const count = `${entry.entries} ${entry.entries === 1 ? "Entry" : "Entries"}`;
  if (entry.status === "completed") {
    return `${count} · Completed${entry.won ? " - Won" : ""}`;
  }
  const days = entry.daysLeft ?? 0;
  return `${count} · ${days} ${days === 1 ? "day" : "days"} left`;
}

// TODO: replace with the user's won draws from the backend.
export const WINS: Entry[] = ["w1", "w2", "w3"].map((id) => ({
  id,
  title: "UK Used 2026 Honda Civic",
  entries: 45,
  status: "completed",
  category: "cars",
  brand: "Honda",
  voucherPrice: 500,
  assetValue: 900_000,
  won: true,
  enteredDaysAgo: 0,
}));
