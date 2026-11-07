/** The fields the Filters sheet can filter on. Entries and draws both have them. */
export type Filterable = {
  category: CategoryId;
  brand: string;
  /** Price of one voucher, in naira */
  voucherPrice: number;
  /** Value of the prize, in naira */
  assetValue: number;
};

export type CategoryId = "cars" | "suvs" | "luxury" | "gadgets" | "realEstate";

export type Category = {
  id: CategoryId;
  label: string;
  /** Shown disabled with a "Coming Soon" tag. */
  comingSoon?: boolean;
};

export const CATEGORIES: Category[] = [
  { id: "cars", label: "Cars" },
  { id: "suvs", label: "SUVs" },
  { id: "luxury", label: "Luxury vehicles" },
  { id: "gadgets", label: "Gadgets", comingSoon: true },
  { id: "realEstate", label: "Real estate", comingSoon: true },
];

export type PriceBucketId = "500" | "1000" | "2000plus";

export const PRICE_BUCKETS: {
  id: PriceBucketId;
  label: string;
  matches: (price: number) => boolean;
}[] = [
  { id: "500", label: "N500", matches: (p) => p === 500 },
  { id: "1000", label: "N1,000", matches: (p) => p === 1000 },
  { id: "2000plus", label: "N2,000 and above", matches: (p) => p >= 2000 },
];

/** Bounds of the asset value slider, in naira. */
export const ASSET_RANGE = { min: 500_000, max: 2_500_000, step: 100_000 };

// TODO: replace with the brands the backend offers for each category.
// Cars matches the design; the other groups are placeholders.
export const BRAND_GROUPS: { id: string; label: string; brands: string[] }[] = [
  {
    id: "cars",
    label: "Cars",
    brands: [
      "Toyota",
      "Honda",
      "Ford",
      "Mercedes Benz",
      "Lexus",
      "Acura",
      "Hyundai",
      "Kia",
    ],
  },
  { id: "suvs", label: "SUVs", brands: ["Land Rover", "Jeep", "Nissan"] },
  {
    id: "luxury",
    label: "Luxury Vehicles",
    brands: ["BMW", "Audi", "Porsche", "Bentley"],
  },
  { id: "gadgets", label: "Gadgets", brands: ["Apple", "Samsung", "Sony"] },
];

/** What the Filters sheet edits. */
export type EntryFilters = {
  categories: CategoryId[];
  prices: PriceBucketId[];
  assetRange: [number, number];
  brands: string[];
};

export const DEFAULT_FILTERS: EntryFilters = {
  categories: [],
  prices: [],
  assetRange: [ASSET_RANGE.min, ASSET_RANGE.max],
  brands: [],
};

/** An empty selection in a group means "don't filter by this group". */
export function matchesFilters(entry: Filterable, f: EntryFilters): boolean {
  if (f.categories.length && !f.categories.includes(entry.category)) {
    return false;
  }
  if (
    f.prices.length &&
    !PRICE_BUCKETS.some(
      (b) => f.prices.includes(b.id) && b.matches(entry.voucherPrice),
    )
  ) {
    return false;
  }
  if (
    entry.assetValue < f.assetRange[0] ||
    entry.assetValue > f.assetRange[1]
  ) {
    return false;
  }
  if (f.brands.length && !f.brands.includes(entry.brand)) return false;
  return true;
}
