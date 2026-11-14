// Converts API listings into the shape the listing screens display.

import type { ApiListing } from "@/lib/api";
import type { CategoryId } from "@/data/filters";
import { BRAND_GROUPS } from "@/data/filters";
import type { Listing, ListingInfo } from "@/data/listings";

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
const KNOWN_BRANDS = BRAND_GROUPS.flatMap((group) => group.brands);

const CONDITION_LABELS: Record<ApiListing["condition"], string> = {
  brand_new: "Brand New",
  foreign_used: "Foreign Used",
  nigerian_used: "Nigerian Used",
};

/** "2026-09-24T19:00:00Z" -> "24 Sep, 8PM" (in the phone's time zone). */
export function formatDrawDate(iso: string): string {
  const date = new Date(iso);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const time = `${hours % 12 || 12}${minutes ? `:${String(minutes).padStart(2, "0")}` : ""}${hours < 12 ? "AM" : "PM"}`;
  return `${date.getDate()} ${MONTHS[date.getMonth()]}, ${time}`;
}

function capitalise(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

// The API has no make field yet, so find a known brand in the title.
function brandFromTitle(title: string) {
  const lower = title.toLowerCase();
  return (
    KNOWN_BRANDS.find((brand) => lower.includes(brand.toLowerCase())) ?? ""
  );
}

function categoryFor(bodyType: ApiListing["bodyType"]): CategoryId {
  return bodyType === "suv" ? "suvs" : "cars";
}

function badgeFor(daysLeft: number, listedDaysAgo: number) {
  if (listedDaysAgo <= 7 && daysLeft > 3) {
    return { badge: "new" as const, badgeLabel: "NEW" };
  }
  const badgeLabel =
    daysLeft <= 0
      ? "ENDS TODAY"
      : daysLeft === 1
        ? "1 DAY LEFT"
        : `${daysLeft} DAYS LEFT`;
  return { badge: "ending" as const, badgeLabel };
}

function infoFor(api: ApiListing): ListingInfo {
  const condition = [
    { label: "Exterior", value: api.conditionExterior },
    { label: "Interior", value: api.conditionInterior },
    { label: "Mechanical", value: api.conditionMechanical },
  ].filter((row): row is { label: string; value: string } =>
    Boolean(row.value),
  );

  const details = [
    { label: "Year", value: String(api.year) },
    { label: "Condition", value: CONDITION_LABELS[api.condition] },
    { label: "Body Type", value: api.bodyType && capitalise(api.bodyType) },
    {
      label: "Transmission",
      value: api.transmission && capitalise(api.transmission),
    },
    { label: "Fuel Type", value: api.fuelType && capitalise(api.fuelType) },
    { label: "Engine", value: api.engine },
    { label: "Drive Type", value: api.driveType },
    { label: "Exterior Color", value: api.colour },
    { label: "Interior Color", value: api.interiorColour },
    {
      label: "Mileage",
      value:
        api.mileageKm === null
          ? null
          : `${api.mileageKm.toLocaleString("en-NG")}km`,
    },
    { label: "Location", value: api.locationState },
  ].filter((row): row is { label: string; value: string } =>
    Boolean(row.value),
  );

  return {
    overview: api.description
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean),
    included: api.whatsIncluded,
    condition,
    details,
  };
}

/** Sample listings use short ids like "f1"; the API's are 24-character hex. */
export function isApiListingId(id: string) {
  return /^[a-f\d]{24}$/.test(id);
}

export function toListing(api: ApiListing, now = Date.now()): Listing {
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(api.drawDate).getTime() - now) / DAY_MS),
  );
  const listedDaysAgo = Math.max(
    0,
    Math.floor((now - new Date(api.createdAt).getTime()) / DAY_MS),
  );

  return {
    id: api.id,
    title: api.title,
    category: categoryFor(api.bodyType),
    brand: brandFromTitle(api.title),
    voucherPrice: api.voucherPriceNaira,
    assetValue: api.estimatedValueNaira,
    drawDate: formatDrawDate(api.drawDate),
    daysLeft,
    listedDaysAgo,
    ...badgeFor(daysLeft, listedDaysAgo),
    featured: api.featured,
    savedByMe: api.savedByMe,
    // TODO: a placeholder image when a listing has none.
    image: api.images[0] ?? "",
    images: api.images.length > 0 ? api.images : undefined,
    description: api.description || undefined,
    info: infoFor(api),
  };
}
