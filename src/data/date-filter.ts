import type { FilterOption } from "@/components/filter-dropdown";

export type DateFilter =
  | "today"
  | "last7"
  | "last30"
  | "thisMonth"
  | "lastMonth"
  | "last3Months"
  | "thisYear"
  | "all";

export const DATE_OPTIONS: FilterOption<DateFilter>[] = [
  { value: "today", label: "Today" },
  { value: "last7", label: "Last 7 Days" },
  { value: "last30", label: "Last 30 Days" },
  { value: "thisMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
  { value: "last3Months", label: "Last 3 Months" },
  { value: "thisYear", label: "This Year" },
  { value: "all", label: "All Time" },
];

const DAY_MS = 24 * 60 * 60 * 1000;

/** Inclusive [min, max] range of "days ago" that a date filter accepts. */
export function daysAgoRange(
  filter: DateFilter,
  now = new Date(),
): [number, number] {
  const dayOfMonth = now.getDate();
  const dayOfYear =
    Math.floor(
      (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) -
        Date.UTC(now.getFullYear(), 0, 0)) /
        DAY_MS,
    ) - 1;
  const daysInLastMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    0,
  ).getDate();

  switch (filter) {
    case "today":
      return [0, 0];
    case "last7":
      return [0, 6];
    case "last30":
      return [0, 29];
    case "thisMonth":
      return [0, dayOfMonth - 1];
    case "lastMonth":
      return [dayOfMonth, dayOfMonth + daysInLastMonth - 1];
    case "last3Months":
      return [0, 89];
    case "thisYear":
      return [0, dayOfYear];
    case "all":
      return [0, Infinity];
  }
}
