import type { CategoryId } from "@/data/filters";

export type ListingBadge = "new" | "ending";

export type Listing = {
  id: string;
  title: string;
  category: CategoryId;
  brand: string;
  /** Price of one voucher entry, in naira */
  voucherPrice: number;
  /** Value of the prize, in naira */
  assetValue: number;
  drawDate: string;
  /** Days until the draw closes (for "Closing Soon" sorting). */
  daysLeft: number;
  /** How many days ago the listing went up (for "New to old" sorting). */
  listedDaysAgo: number;
  badge: ListingBadge;
  /** Text shown inside the badge */
  badgeLabel: string;
  /** Result of require("...png") */
  image: number;
};

// TODO: replace this sample data with the real listings from the backend.
const bronco = require("@/assets/images/listings/Broncoo 1.png");
const civic = require("@/assets/images/listings/Hondaa 2.png");
const tundra = require("@/assets/images/listings/Camryy 1.png");

export const FEATURED_LISTINGS: Listing[] = [
  {
    id: "f1",
    title: "UK Used 2026 Ford Bronco",
    category: "cars",
    brand: "Ford",
    voucherPrice: 500,
    assetValue: 2_100_000,
    drawDate: "24 Sep, 8PM",
    daysLeft: 12,
    listedDaysAgo: 1,
    badge: "new",
    badgeLabel: "NEW",
    image: bronco,
  },
  {
    id: "f2",
    title: "UK Used 2026 Honda Civic",
    category: "cars",
    brand: "Honda",
    voucherPrice: 500,
    assetValue: 900_000,
    drawDate: "24 Sep, 8PM",
    daysLeft: 3,
    listedDaysAgo: 20,
    badge: "ending",
    badgeLabel: "3 DAYS LEFT",
    image: civic,
  },
];

export const BROWSE_LISTINGS: Listing[] = [
  {
    id: "b1",
    title: "UK Used 2026 Toyota Tundra",
    category: "cars",
    brand: "Toyota",
    voucherPrice: 500,
    assetValue: 1_200_000,
    drawDate: "24 Sep, 8PM",
    daysLeft: 3,
    listedDaysAgo: 18,
    badge: "ending",
    badgeLabel: "3 DAYS LEFT",
    image: tundra,
  },
  {
    id: "b2",
    title: "UK Used 2026 Ford Bronco",
    category: "cars",
    brand: "Ford",
    voucherPrice: 500,
    assetValue: 2_100_000,
    drawDate: "30 Sep, 8PM",
    daysLeft: 9,
    listedDaysAgo: 2,
    badge: "new",
    badgeLabel: "NEW",
    image: bronco,
  },
  {
    id: "b3",
    title: "UK Used 2026 Honda Civic",
    category: "cars",
    brand: "Honda",
    voucherPrice: 500,
    assetValue: 900_000,
    drawDate: "30 Sep, 8PM",
    daysLeft: 9,
    listedDaysAgo: 1,
    badge: "new",
    badgeLabel: "NEW",
    image: civic,
  },
];

/** Everything on the Browse Listings screen. */
export const ALL_LISTINGS: Listing[] = [
  BROWSE_LISTINGS[0], // Toyota Tundra
  BROWSE_LISTINGS[2], // Honda Civic
  {
    id: "l3",
    title: "UK Used 2026 Toyota Tundra",
    category: "cars",
    brand: "Toyota",
    voucherPrice: 1000,
    assetValue: 1_500_000,
    drawDate: "24 Sep, 8PM",
    daysLeft: 3,
    listedDaysAgo: 14,
    badge: "ending",
    badgeLabel: "3 DAYS LEFT",
    image: tundra,
  },
  {
    id: "l4",
    title: "UK Used 2026 Honda Civic",
    category: "cars",
    brand: "Honda",
    voucherPrice: 500,
    assetValue: 900_000,
    drawDate: "30 Sep, 8PM",
    daysLeft: 9,
    listedDaysAgo: 3,
    badge: "new",
    badgeLabel: "NEW",
    image: civic,
  },
  BROWSE_LISTINGS[1], // Ford Bronco
  {
    id: "l6",
    title: "UK Used 2026 Ford Bronco",
    category: "cars",
    brand: "Ford",
    voucherPrice: 2000,
    assetValue: 2_300_000,
    drawDate: "2 Oct, 8PM",
    daysLeft: 11,
    listedDaysAgo: 5,
    badge: "new",
    badgeLabel: "NEW",
    image: bronco,
  },
];
