export type ListingBadge = "new" | "ending";

export type Listing = {
  id: string;
  title: string;
  /** Price of one voucher entry, in naira */
  voucherPrice: number;
  drawDate: string;
  badge: ListingBadge;
  /** Text shown inside the badge */
  badgeLabel: string;
  /** Result of require("...png") */
  image: number;
};

// TODO: replace this sample data with the real listings from the backend.
const bronco = require("@/assets/images/Broncoo 1.png");
const civic = require("@/assets/images/Hondaa 2.png");
const camry = require("@/assets/images/Camryy 1.png");

export const FEATURED_LISTINGS: Listing[] = [
  {
    id: "f1",
    title: "UK Used 2026 Ford Bronco",
    voucherPrice: 500,
    drawDate: "24 Sep, 8PM",
    badge: "new",
    badgeLabel: "NEW",
    image: bronco,
  },
  {
    id: "f2",
    title: "UK Used 2026 Honda Civic",
    voucherPrice: 500,
    drawDate: "24 Sep, 8PM",
    badge: "ending",
    badgeLabel: "3 DAYS LEFT",
    image: civic,
  },
];

export const BROWSE_LISTINGS: Listing[] = [
  {
    id: "b1",
    title: "UK Used 2026 Toyota Camry",
    voucherPrice: 500,
    drawDate: "24 Sep, 8PM",
    badge: "ending",
    badgeLabel: "3 DAYS LEFT",
    image: camry,
  },
  {
    id: "b2",
    title: "UK Used 2026 Ford Bronco",
    voucherPrice: 500,
    drawDate: "30 Sep, 8PM",
    badge: "new",
    badgeLabel: "NEW",
    image: bronco,
  },
  {
    id: "b3",
    title: "UK Used 2026 Honda Civic",
    voucherPrice: 500,
    drawDate: "30 Sep, 8PM",
    badge: "new",
    badgeLabel: "NEW",
    image: civic,
  },
];
