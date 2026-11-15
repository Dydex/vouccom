// Draws come from listings: every listing has its own draw.

import type { Draw, DrawListItem } from "@/data/draws";
import type { ApiListing, MyEntry } from "@/lib/api";
import { calendarDaysBetween } from "@/lib/dates";
import { toEntry } from "@/lib/entries";
import { toListing } from "@/lib/listings";

const HOUR_MS = 60 * 60 * 1000;

/** "24 Sep, 8PM" -> "24 Sep" */
function dayOf(drawDate: string) {
  return drawDate.split(",")[0];
}

/** A draw the user has entered that hasn't happened yet, or null. */
export function toMyDraw(api: MyEntry, now = Date.now()): Draw | null {
  if (!api.listing || api.listing.status !== "live") return null;
  const listing = toListing(api.listing, now);
  return {
    id: api.listingId,
    title: listing.title,
    // The draw date has come: it's on now.
    live: listing.daysLeft === 0,
    category: listing.category,
    brand: listing.brand,
    voucherPrice: listing.voucherPrice,
    assetValue: listing.assetValue,
    drawDate: dayOf(listing.drawDate),
    daysLeft: listing.daysLeft,
    enteredDaysAgo: toEntry(api, now).enteredDaysAgo,
  };
}

function timeLabel(
  status: DrawListItem["status"],
  drawTime: number,
  daysAgo: number,
  now: number,
) {
  if (status === "completed") {
    return daysAgo === 0
      ? "today"
      : `${daysAgo} ${daysAgo === 1 ? "day" : "days"} ago`;
  }
  if (status === "live") return "on now";
  const hours = Math.ceil((drawTime - now) / HOUR_MS);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} left`;
  const days = Math.ceil(hours / 24);
  return `${days} days left`;
}

/** A row on the Draws tab. One listing is one draw with one asset. */
export function toDrawItem(api: ApiListing, now = Date.now()): DrawListItem {
  const listing = toListing(api, now);
  const drawDate = new Date(api.drawDate);
  const status =
    api.status === "closed"
      ? "completed"
      : listing.daysLeft === 0
        ? "live"
        : "upcoming";
  const daysAgo = Math.max(0, calendarDaysBetween(drawDate, new Date(now)));

  return {
    id: api.id,
    title: listing.title,
    status,
    assets: 1,
    assetList: [{ title: listing.title, listingId: api.id }],
    drawDate: listing.drawDate,
    date: `${dayOf(listing.drawDate)}.`,
    timeLabel: timeLabel(status, drawDate.getTime(), daysAgo, now),
    daysAgo,
    category: listing.category,
    brand: listing.brand,
    voucherPrice: listing.voucherPrice,
    assetValue: listing.assetValue,
  };
}
