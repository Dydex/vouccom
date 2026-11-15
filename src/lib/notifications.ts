import type { Href } from "expo-router";

import type { NotificationType } from "@/lib/api";

/** Where tapping a notification goes, if anywhere. */
export function targetFor(notification: {
  type: NotificationType;
  meta?: Record<string, string> | null;
}): Href | undefined {
  const listingId = notification.meta?.listingId;
  switch (notification.type) {
    case "listing_live":
    case "draw_result":
    case "voucher_purchased":
      return listingId
        ? { pathname: "/listing/[id]", params: { id: listingId } }
        : "/listings";
    case "wallet_funded":
      return "/wallet";
    case "prize_won":
      return "/home/myWins";
    case "kyc_verified":
      return "/profile/identity";
    default:
      return undefined;
  }
}

const TYPES: NotificationType[] = [
  "wallet_funded",
  "voucher_purchased",
  "kyc_verified",
  "listing_live",
  "new_signup",
  "prize_won",
  "draw_result",
];

/**
 * Where a tapped push notification goes. Accepts a `url` path, or the same
 * `type` and ids as the notifications list (flat or under `meta`).
 */
export function targetForPush(
  data: Record<string, unknown> | undefined,
): Href | undefined {
  if (!data) return undefined;
  if (typeof data.url === "string" && data.url.startsWith("/")) {
    return data.url as Href;
  }
  const type = data.type as NotificationType;
  if (!TYPES.includes(type)) return undefined;
  const meta = (
    typeof data.meta === "object" && data.meta !== null ? data.meta : data
  ) as Record<string, string>;
  return targetFor({ type, meta });
}
