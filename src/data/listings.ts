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
  // Optional details for the listing screen (fall back to sensible defaults).
  /** Full name shown on the details screen, e.g. "Foreign Used 2026 Honda Civic". */
  detailTitle?: string;
  description?: string;
  /** Gallery images; defaults to just `image`. */
  images?: number[];
  /** The signed-in user's entries in this draw, if any. */
  userEntries?: { count: number; daysAgo: number };
  /** Text for the Description pop-up; defaults to a generic version. */
  info?: ListingInfo;
  /** Where the draw is streamed, e.g. a YouTube link. */
  drawLink?: string;
};

export type ListingInfo = {
  overview: string[];
  included: string[];
  condition: { label: string; value: string }[];
  /** The "Vehicle Details" table. */
  details: { label: string; value: string }[];
};

// TODO: replace this sample data with the real listings from the backend.
const bronco = require("@/assets/images/listings/Broncoo 1.png");
const civic = require("@/assets/images/listings/Hondaa 2.png");
const tundra = require("@/assets/images/listings/Camryy 1.png");

const DEFAULT_CONDITION = [
  {
    label: "Exterior",
    value:
      "Excellent condition with a clean body finish and no visible structural damage.",
  },
  {
    label: "Interior",
    value:
      "Clean cabin with well-maintained seats, dashboard, and infotainment system.",
  },
  {
    label: "Mechanical",
    value:
      "Engine, transmission, suspension, and braking system have been inspected and verified to be in good working condition.",
  },
];

const DEFAULT_INCLUDED = [
  "Original ignition keys",
  "Owner's manual",
  "Verified import documents",
  "Vehicle inspection certificate",
  "Standard accessory package",
];

// TODO: the backend should return these details (and a real photo gallery).
const CIVIC_DETAILS = {
  detailTitle: "Foreign Used 2026 Honda Civic",
  images: [civic, civic, civic, civic],
  userEntries: { count: 45, daysAgo: 3 },
  drawLink: "https://www.youtube.com",
  info: {
    overview: [
      "The 2026 Honda Civic is a stylish and reliable sedan designed for everyday comfort and performance. This foreign used vehicle has been carefully inspected to ensure it meets VOUCCOM's quality standards before being listed.",
      "Featuring a refined interior, advanced driver assistance technologies, impressive fuel efficiency, and a responsive driving experience, the Civic remains one of the most trusted vehicles in its class. Whether you're commuting daily or planning long-distance trips, it delivers practicality without compromising on comfort.",
    ],
    included: DEFAULT_INCLUDED,
    condition: DEFAULT_CONDITION,
    details: [
      { label: "Make", value: "Honda" },
      { label: "Model", value: "Civic" },
      { label: "Year", value: "2026" },
      { label: "Condition", value: "Foreign Used (UK)" },
      { label: "Body Type", value: "Sedan" },
      { label: "Transmission", value: "Automatic" },
      { label: "Fuel Type", value: "Petrol" },
      { label: "Engine", value: "2.0L 4-Cylinder" },
      { label: "Drive Type", value: "Front-Wheel Drive" },
      { label: "Exterior Color", value: "Red" },
      { label: "Interior Color", value: "Black" },
      { label: "Mileage", value: "18,000km" },
      { label: "VIN Status", value: "Registered" },
      { label: "Registration", value: "Not Registered" },
    ],
  },
};

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
    userEntries: { count: 5, daysAgo: 1 },
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
    ...CIVIC_DETAILS,
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
    userEntries: { count: 12, daysAgo: 2 },
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
    userEntries: { count: 5, daysAgo: 1 },
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
    ...CIVIC_DETAILS,
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
    userEntries: { count: 8, daysAgo: 3 },
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
    ...CIVIC_DETAILS,
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

/** Looks a listing up by id across every sample list. */
export function findListing(id: string): Listing | undefined {
  return [...FEATURED_LISTINGS, ...BROWSE_LISTINGS, ...ALL_LISTINGS].find(
    (l) => l.id === id,
  );
}

export function listingDescription(listing: Listing): string {
  return (
    listing.description ??
    `A well-maintained ${(listing.detailTitle ?? listing.title)
      .replace(/^(UK|Foreign) Used /, "foreign used ")
      .replace(
        /^New /,
        "new ",
      )} offering a balance of comfort, efficiency, and modern technology. Verified by VOUCCOM and available through our draw.`
  );
}

/** The Description pop-up text, with a generic fallback built from the title. */
export function listingInfo(listing: Listing): ListingInfo {
  if (listing.info) return listing.info;
  const name = (listing.detailTitle ?? listing.title).replace(
    /^(UK|Foreign) Used /,
    "",
  );
  const model = name.split(" ").pop();
  return {
    overview: [
      `The ${name} is a stylish and reliable vehicle designed for everyday comfort and performance. This foreign used vehicle has been carefully inspected to ensure it meets VOUCCOM's quality standards before being listed.`,
      `Whether you're commuting daily or planning long-distance trips, the ${model} delivers practicality without compromising on comfort.`,
    ],
    included: DEFAULT_INCLUDED,
    condition: DEFAULT_CONDITION,
    // Only what the title tells us; the rest comes from the backend.
    details: vehicleDetailsFromTitle(name),
  };
}

/** "2026 Toyota Tundra" -> Make, Model, Year and Condition rows. */
function vehicleDetailsFromTitle(name: string): ListingInfo["details"] {
  const m = name.match(/^(\d{4})\s+(\S+)\s+(.+)$/);
  if (!m) return [];
  const [, year, make, model] = m;
  return [
    { label: "Make", value: make },
    { label: "Model", value: model },
    { label: "Year", value: year },
    { label: "Condition", value: "Foreign Used (UK)" },
  ];
}

export function drawStatus(listing: Listing): string {
  return listing.daysLeft > 0 ? "Upcoming" : "Live";
}

const MONTHS: Record<string, string> = {
  Jan: "January",
  Feb: "February",
  Mar: "March",
  Apr: "April",
  May: "May",
  Jun: "June",
  Jul: "July",
  Aug: "August",
  Sep: "September",
  Oct: "October",
  Nov: "November",
  Dec: "December",
};

/** "24 Sep, 8PM" -> "24 September · 8:00PM" (falls back to the original text). */
export function formatDrawDateTime(drawDate: string): string {
  const m = drawDate.match(/^(\d+)\s+(\w+),\s*(\d+)(?::(\d+))?\s*(AM|PM)$/i);
  if (!m) return drawDate;
  const [, day, month, hour, minutes = "00", meridiem] = m;
  return `${day} ${MONTHS[month] ?? month} · ${hour}:${minutes}${meridiem.toUpperCase()}`;
}

/** Where the draw is streamed. TODO: drop the fallback once the backend returns real links. */
export function drawLinkUrl(listing: Listing): string {
  return listing.drawLink ?? "https://www.youtube.com";
}
