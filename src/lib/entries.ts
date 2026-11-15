// Converts the API's entries into the shape the entry rows display.

import type { Entry } from "@/data/entries";
import type { MyEntry } from "@/lib/api";
import { toListing } from "@/lib/listings";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Calendar days between two dates in the phone's time zone; 0 = same day. */
function calendarDaysBetween(earlier: Date, later: Date) {
  const start = new Date(earlier).setHours(0, 0, 0, 0);
  const end = new Date(later).setHours(0, 0, 0, 0);
  return Math.round((end - start) / DAY_MS);
}

export function toEntry(api: MyEntry, now = Date.now()): Entry {
  const enteredDaysAgo = Math.max(
    0,
    calendarDaysBetween(new Date(api.lastEntryAt), new Date(now)),
  );

  if (!api.listing) {
    return {
      id: api.listingId,
      title: "Listing no longer available",
      entries: api.quantity,
      status: "completed",
      category: "cars",
      brand: "",
      voucherPrice: 0,
      assetValue: 0,
      enteredDaysAgo,
    };
  }

  const listing = toListing(api.listing, now);
  return {
    id: api.listingId,
    title: listing.title,
    entries: api.quantity,
    status: api.listing.status === "live" ? "active" : "completed",
    category: listing.category,
    brand: listing.brand,
    voucherPrice: listing.voucherPrice,
    assetValue: listing.assetValue,
    daysLeft: listing.daysLeft,
    enteredDaysAgo,
  };
}
