// Vouccom API client. Docs: https://vouccom.com/api/docs

import { File } from "expo-file-system";

export const API_URL = process.env.EXPO_PUBLIC_API_URL;

const TIMEOUT_MS = 20_000;

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

/** Thrown for every failed request. `message` is safe to show to the user. */
export class ApiError extends Error {
  code: string;
  /** 0 when there was no response (offline or timed out). */
  status: number;
  requestId?: string;
  details?: unknown;
  /** Seconds, from the Retry-After header on 429. */
  retryAfter?: number;

  constructor(
    message: string,
    options: {
      code: string;
      status: number;
      requestId?: string;
      details?: unknown;
      retryAfter?: number;
    },
  ) {
    super(message);
    this.name = "ApiError";
    this.code = options.code;
    this.status = options.status;
    this.requestId = options.requestId;
    this.details = options.details;
    this.retryAfter = options.retryAfter;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  timeoutMs?: number;
  headers?: Record<string, string>;
};

/** Calls the API and returns the parsed JSON. Throws ApiError on failure. */
export async function request<T>(
  path: string,
  {
    method = "GET",
    body,
    timeoutMs = TIMEOUT_MS,
    headers: extraHeaders,
  }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    // Required for /auth/login to return a token instead of a cookie.
    "X-Client-Type": "mobile",
    ...extraHeaders,
  };
  // FormData sets its own Content-Type, with the multipart boundary.
  const isForm = body instanceof FormData;
  if (body !== undefined && !isForm) {
    headers["Content-Type"] = "application/json";
  }
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body:
        body === undefined ? undefined : isForm ? body : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (cause) {
    // The user sees a friendly message; the real reason goes to the dev console.
    if (__DEV__)
      console.warn(`${method} ${path} failed before a response:`, cause);
    throw new ApiError(
      controller.signal.aborted
        ? "The server took too long to answer. Please try again."
        : "Can't reach Vouccom. Check your internet connection.",
      {
        code: controller.signal.aborted ? "TIMEOUT" : "NETWORK_ERROR",
        status: 0,
      },
    );
  } finally {
    clearTimeout(timer);
  }

  // Read as text first: some responses have an empty body.
  const text = await response.text();
  const data = text ? safeJsonParse(text) : undefined;

  if (!response.ok) {
    const error = (data as { error?: Partial<ErrorBody> } | undefined)?.error;
    const retryAfter = Number(response.headers.get("Retry-After"));
    throw new ApiError(
      // VALIDATION_FAILED only says "Invalid request"; the field message is more useful.
      firstFieldMessage(error?.details) ??
        error?.message ??
        `Something went wrong (status ${response.status}).`,
      {
        code: error?.code ?? "HTTP_ERROR",
        status: response.status,
        requestId: error?.requestId,
        details: error?.details,
        retryAfter:
          Number.isFinite(retryAfter) && retryAfter > 0
            ? retryAfter
            : undefined,
      },
    );
  }

  return data as T;
}

type ErrorBody = {
  code: string;
  message: string;
  requestId: string;
  details?: unknown;
};

/** An entry of `details` in a VALIDATION_FAILED response. */
export type FieldIssue = {
  path: (string | number)[];
  message: string;
};

function firstFieldMessage(details: unknown): string | undefined {
  if (!Array.isArray(details)) return undefined;
  const first = details[0] as Partial<FieldIssue> | undefined;
  return typeof first?.message === "string" ? first.message : undefined;
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

// --- Endpoints ---

export type Health = {
  status: string;
  uptime: number;
  db: string;
};

export function checkHealth() {
  return request<Health>("/health");
}

// --- Auth ---

export type KycStatus =
  "unverified" | "pending" | "verified" | "rejected" | "resubmit_required";

/** Subset of the API's `User` schema. */
export type User = {
  id: string;
  email: string;
  phone: string | null;
  status: "active" | "suspended" | "closed";
  profile: {
    firstName: string;
    lastName: string;
    address: string | null;
    city: string | null;
    country: string | null;
    dateOfBirth: string | null;
    avatarUrl: string | null;
  };
  emailVerifiedAt: string | null;
  phoneVerifiedAt: string | null;
  kyc?: { status: KycStatus };
  notificationPrefs?: NotificationPrefs;
};

/** What the user wants to hear about, and how. */
export type NotificationPrefs = {
  email: boolean;
  sms: boolean;
  promotional: boolean;
  drawReminders: boolean;
  winnerAnnouncements: boolean;
};

export type ProfileUpdate = {
  firstName?: string;
  lastName?: string;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  /** YYYY-MM-DD */
  dateOfBirth?: string | null;
  /** Only the preferences being changed. */
  notificationPrefs?: Partial<NotificationPrefs>;
};

/** Only for accounts created without a phone (409 otherwise). Returns the updated user. */
export function addPhone(phone: string) {
  return request<{ user: User }>("/auth/me/phone", {
    method: "POST",
    body: { phone },
  });
}

/**
 * Texts a 6-digit code. SMS isn't live yet: `sent` is false, and outside
 * production `devCode` holds the code instead.
 */
export function requestPhoneCode(phone: string) {
  return request<{ sent: boolean; devCode?: string }>(
    "/auth/verify/phone/request",
    { method: "POST", body: { phone } },
  );
}

export function verifyPhone(phone: string, code: string) {
  return request<{ verified: boolean }>("/auth/verify/phone", {
    method: "POST",
    body: { phone, code },
  });
}

export const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

/** JPG, PNG or WebP, up to 5 MB. Returns the updated user. */
export function uploadAvatar(file: LocalFile) {
  return request<{ user: User }>("/auth/me/avatar", {
    method: "POST",
    body: formWithFile(file),
    timeoutMs: 60_000,
  });
}

/** Updates only the fields sent. Returns the updated user. */
export function updateMe(update: ProfileUpdate) {
  return request<{ user: User }>("/auth/me", { method: "PATCH", body: update });
}

export function login(email: string, password: string) {
  return request<{ user: User; token?: string }>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export type SignupInput = {
  firstName: string;
  lastName: string;
  email: string;
  /** Digits only, no leading 0, e.g. "8031234567". */
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: true;
};

/** Creates the account without a session; the email must be verified before login. */
export function signup(input: SignupInput) {
  return request<{ user: User; next?: string }>("/auth/signup", {
    method: "POST",
    body: input,
  });
}

/** Rate limited to 5 per hour per email. */
export function requestEmailCode(email: string) {
  return request<{ sent: boolean }>("/auth/verify/email/request", {
    method: "POST",
    body: { email },
  });
}

export function verifyEmail(email: string, code: string) {
  return request<unknown>("/auth/verify/email", {
    method: "POST",
    body: { email, code },
  });
}

/** Always succeeds, so it never reveals whether the email has an account. */
export function forgotPassword(email: string) {
  return request<unknown>("/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}

/** Signs the account out on every device. Wrong or expired codes return 400. */
export function resetPassword(
  email: string,
  code: string,
  newPassword: string,
) {
  return request<unknown>("/auth/reset-password", {
    method: "POST",
    body: { email, code, newPassword },
  });
}

/** For a signed-in user who knows their current password. */
export function changePassword(currentPassword: string, newPassword: string) {
  return request<unknown>("/auth/password", {
    method: "PATCH",
    body: { currentPassword, newPassword },
  });
}

export function getMe(options: { timeoutMs?: number } = {}) {
  return request<{ user: User }>("/auth/me", options);
}

export function logout() {
  return request<{ ok: boolean }>("/auth/logout", { method: "POST" });
}

/** Ends every session, including this one. */
export function logoutAll() {
  return request<{ ok: boolean }>("/auth/logout-all", { method: "POST" });
}

/** A signed-in device. */
export type Session = {
  id: string;
  /** The session making this request: this phone. */
  current: boolean;
  ip: string | null;
  userAgent: string | null;
  lastSeenAt: string;
  createdAt: string;
};

export function getSessions() {
  return request<{ sessions: Session[] }>("/auth/sessions");
}

/** Signs one device out. Also succeeds if it was already gone. */
export function revokeSession(id: string) {
  return request<{ ok: boolean }>(`/auth/sessions/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

// --- Listings ---

/** A listing as the API sends it (the `Listing` schema). */
export type ApiListing = {
  id: string;
  title: string;
  condition: "brand_new" | "foreign_used" | "nigerian_used";
  vin?: string;
  year: number;
  mileageKm: number | null;
  transmission: "automatic" | "manual" | null;
  fuelType: "petrol" | "diesel" | "hybrid" | "electric" | null;
  colour: string | null;
  bodyType:
    | "sedan"
    | "suv"
    | "pickup"
    | "hatchback"
    | "coupe"
    | "wagon"
    | "van"
    | "bus"
    | null;
  locationState: string | null;
  engine: string | null;
  driveType: string | null;
  interiorColour: string | null;
  /** Image URLs. */
  images: string[];
  voucherPriceNaira: number;
  estimatedValueNaira: number;
  /** Null means no cap. */
  totalVouchers: number | null;
  soldCount: number;
  /** ISO date-time; when sales open. */
  startsAt?: string | null;
  /** ISO date-time. */
  drawDate: string;
  status: "draft" | "live" | "closed" | "cancelled";
  verificationStatus?: "unverified" | "in_review" | "verified";
  badges: ("verified" | "inspected" | "secure" | "popular")[];
  featured: boolean;
  /** Reports and media about the asset, each a link to the file. */
  documents?: ListingDocument[];
  whatsIncluded: string[];
  conditionExterior: string | null;
  conditionInterior: string | null;
  conditionMechanical: string | null;
  description: string;
  /** ISO date-time. */
  createdAt: string;
  updatedAt?: string;
  /** Only on GET /listings/{id}, and only meaningful when signed in. */
  savedByMe?: boolean;
};

export type ListingDocumentType =
  | "inspection_report"
  | "service_history"
  | "ownership_history"
  | "accident_records"
  | "import_documentation"
  | "walkthrough_video"
  | "engine_chassis_report"
  | "authenticity_certificate";

export type ListingDocument = { type: ListingDocumentType; url: string };

export type ListingsPage = {
  listings: ApiListing[];
  total: number;
  page: number;
  pages: number;
};

/** Live listings, soonest draw first. */
/** Live listings by default; "closed" for draws that have happened. */
export function getListings(
  page = 1,
  limit = 24,
  status: "live" | "closed" = "live",
) {
  return request<ListingsPage>(
    `/listings?page=${page}&limit=${limit}&status=${status}`,
  );
}

/** 404 for draft, cancelled or not-yet-open listings. */
export function getListing(id: string) {
  return request<{ listing: ApiListing }>(
    `/listings/${encodeURIComponent(id)}`,
  );
}

export type ApiComment = {
  id: string;
  body: string;
  /** Display label, e.g. "David O.", not a full name. */
  author: string;
  /** ISO date-time. */
  createdAt: string;
};

export type CommentsPage = {
  comments: ApiComment[];
  total: number;
  page: number;
  pages: number;
};

export function getComments(listingId: string, page = 1, limit = 20) {
  return request<CommentsPage>(
    `/listings/${encodeURIComponent(listingId)}/comments?page=${page}&limit=${limit}`,
  );
}

/** 1 to 1000 characters. */
export function postComment(listingId: string, body: string) {
  return request<{ comment: ApiComment }>(
    `/listings/${encodeURIComponent(listingId)}/comments`,
    { method: "POST", body: { body } },
  );
}

export type MyListingEntries = {
  /** Vouchers the user holds on this listing; 0 if none. */
  quantity: number;
  ticketNumbers: number[];
  /** Null until the draw has happened. */
  winner: {
    ticketNumber: number;
    isMe: boolean;
    drawVideoUrl: string | null;
  } | null;
};

export function getMyListingEntries(listingId: string) {
  return request<MyListingEntries>(
    `/listings/${encodeURIComponent(listingId)}/entries/mine`,
  );
}

export type MyEntry = {
  listingId: string;
  /** Total vouchers held on this listing. */
  quantity: number;
  /** ISO date-time of the latest purchase. */
  lastEntryAt: string;
  /** Null if the listing has since been removed. */
  listing: ApiListing | null;
};

/** One row per listing the user has entered. */
export function getMyEntries() {
  return request<{ entries: MyEntry[] }>("/entries/mine");
}

// --- Wallet and checkout ---

export type WalletActivity = {
  id: string;
  /** Positive = money in, negative = money out. */
  amountKobo: number;
  /** e.g. "deposit", "voucher_purchase", "refund" */
  type: string;
  /** ISO date-time. */
  at: string;
};

export type Wallet = {
  balanceKobo: number;
  /** Recent activity. */
  entries: WalletActivity[];
};

export function getWallet() {
  return request<Wallet>("/wallet");
}

export const MIN_TOP_UP_NAIRA = 100;
export const MAX_TOP_UP_NAIRA = 5_000_000;

/** Starts a Paystack top-up. Open `authorizationUrl`, then check the status. */
export function startTopUp(amountKobo: number, idempotencyKey: string) {
  return request<{
    reference: string;
    authorizationUrl: string;
    accessCode: string;
  }>("/wallet/fund", {
    method: "POST",
    body: { amountKobo },
    headers: { "Idempotency-Key": idempotencyKey },
  });
}

export type TopUpStatus = "pending" | "succeeded" | "failed" | "abandoned";

export function getTopUpStatus(reference: string) {
  return request<{
    status: TopUpStatus;
    amountKobo: number;
    walletBalanceKobo: number;
  }>(`/wallet/fund/${encodeURIComponent(reference)}`);
}

/** A card saved by Paystack during a card payment. */
export type ApiSavedCard = {
  id: string;
  last4: string;
  /** e.g. "visa", "mastercard", "verve" */
  cardType: string;
  bank: string | null;
  expMonth: string;
  expYear: string;
};

export function getSavedCards() {
  return request<{ cards: ApiSavedCard[] }>("/cart/cards");
}

export function removeSavedCard(id: string) {
  return request<{ ok: boolean }>(`/cart/cards/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

/** A purchase of vouchers on one listing (the `Entry` schema). */
export type ApiEntry = {
  id: string;
  listingId: string;
  quantity: number;
  unitPriceNaira: number;
  totalKobo: number;
  ticketStart: number;
  ticketEnd: number;
  reference: string;
  createdAt: string;
};

export type CartItem = { listingId: string; quantity: number };

/**
 * Pays from the wallet. 402 INSUFFICIENT_FUNDS if the balance is too low.
 * Retrying with the same idempotency key never charges twice.
 */
export function checkoutWithWallet(items: CartItem[], idempotencyKey: string) {
  return request<{ entries: ApiEntry[]; walletBalanceKobo: number }>(
    "/cart/checkout/wallet",
    {
      method: "POST",
      body: { items },
      headers: { "Idempotency-Key": idempotencyKey },
    },
  );
}

export type CheckoutStatus = "pending" | "succeeded" | "failed" | "refunded";

/** Starts a Paystack card payment. Open `authorizationUrl`, then check the status. */
export function startCardCheckout(items: CartItem[], saveCard: boolean) {
  return request<{
    reference: string;
    authorizationUrl: string;
    accessCode: string;
  }>("/cart/checkout/card", {
    method: "POST",
    body: { items, saveCard },
  });
}

/** Charges a saved card directly, with no Paystack page. */
export function checkoutWithSavedCard(
  items: CartItem[],
  cardId: string,
  idempotencyKey: string,
) {
  return request<{ reference: string; status: CheckoutStatus }>(
    "/cart/checkout/saved-card",
    {
      method: "POST",
      body: { items, cardId },
      headers: { "Idempotency-Key": idempotencyKey },
    },
  );
}

/**
 * The result of a card checkout. "refunded" means the card was charged but
 * the order couldn't be filled, so the money went to the wallet.
 */
export function getCheckoutStatus(reference: string) {
  return request<{ status: CheckoutStatus; amountKobo: number }>(
    `/cart/checkout/${encodeURIComponent(reference)}`,
  );
}

// --- Winnings ---

export type WinStatus =
  "selected" | "claimed" | "approved" | "delivered" | "forfeited";

export type ApiWinning = {
  id: string;
  /** "selected" until the winner claims, then "claimed", "approved", "delivered". */
  status: WinStatus;
  /** Vouchers the user held. */
  quantity: number;
  /** Vouchers sold in the draw. */
  totalEntries: number;
  selectedAt: string;
  claimDeadline: string;
  /** Set when staff asked for new documents. */
  documentsRequestReason: string | null;
  claimedAt: string | null;
  approvedAt: string | null;
  deliveredAt: string | null;
  drawVideoUrl: string | null;
  winningTicketNumber: number;
  /** The claim window passed without a claim. */
  expired: boolean;
  listing: ApiListing | null;
};

export function getMyWinnings() {
  return request<{ winnings: ApiWinning[] }>("/winners/mine");
}

export const CLAIM_DOCUMENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];
export const MAX_CLAIM_DOCUMENT_BYTES = 2 * 1024 * 1024;

/** A file picked on the phone. */
export type LocalFile = { uri: string; name: string; mimeType?: string };

/**
 * A multipart body with the file under "file". Expo's fetch (the default in
 * SDK 58) needs a `File`, not React Native's `{ uri, name, type }` object;
 * the File carries its own name and type from the file on disk.
 */
function formWithFile(file: LocalFile) {
  const form = new FormData();
  form.append("file", new File(file.uri));
  return form;
}

/** Stores a government ID or proof of address privately. Returns its private url. */
export function uploadClaimDocument(file: LocalFile) {
  return request<{ url: string; resourceType: string }>(
    "/uploads/claim-document",
    { method: "POST", body: formWithFile(file), timeoutMs: 60_000 },
  );
}

/** Requires verified KYC (403 otherwise) and must be sent before the claim deadline. */
export function submitClaim(
  winningId: string,
  documents: {
    governmentIdUrl: string;
    proofOfAddressUrl: string;
    deliveryAddress?: string;
  },
) {
  return request<{ winner: { id: string; status: WinStatus } }>(
    `/winners/${encodeURIComponent(winningId)}/claim`,
    { method: "POST", body: documents },
  );
}

// --- Identity (KYC) ---

export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;

export type NigerianState = (typeof NIGERIAN_STATES)[number];

export type Kyc = {
  status: KycStatus;
  tier: 0 | 1 | 2 | 3;
  verifiedAt: string | null;
  /** Why the last attempt failed. */
  rejectionReason: string | null;
  legalName: { first: string; middle?: string; last: string } | null;
  state?: NigerianState;
};

export function getKycStatus() {
  return request<{ kyc: Kyc }>("/kyc/status");
}

/**
 * Checks the NIN against the national register, matching the profile name and
 * this date of birth (YYYY-MM-DD). A mismatch is still a 200, with
 * `status: "rejected"` and a `reason` to show. Must be 18 or over.
 */
export function verifyNin(input: {
  nin: string;
  dateOfBirth: string;
  state: NigerianState;
}) {
  return request<{
    status: "verified" | "rejected";
    reason?: string;
    kyc: Kyc;
  }>("/kyc/nin", { method: "POST", body: input });
}

// --- Purchases ---

export type PurchaseKind = "entry" | "checkout";
export type PurchaseStatus = "succeeded" | "pending" | "failed" | "refunded";

/** One row of the purchase history. */
export type ApiPurchase = {
  id: string;
  /** "entry" for one listing, "checkout" for a cart. */
  kind: PurchaseKind;
  date: string;
  /** Listing title, or "N listings" for a multi-listing cart. */
  asset: string;
  qty: number;
  amountKobo: number;
  status: PurchaseStatus;
  /** Set for a completed single-listing purchase. */
  listingId: string | null;
};

export type PurchasesPage = {
  purchases: ApiPurchase[];
  total: number;
  page: number;
  pages: number;
};

export function getPurchases(page = 1, limit = 20) {
  return request<PurchasesPage>(`/purchases/mine?page=${page}&limit=${limit}`);
}

/** A purchase's receipt. */
export type ApiReceipt = {
  id: string;
  kind: PurchaseKind;
  date: string;
  status: PurchaseStatus;
  amountKobo: number;
  items: {
    listingId: string;
    title: string;
    image: string | null;
    quantity: number;
    unitPriceNaira: number | null;
    totalKobo: number | null;
    /** Null until the purchase succeeds. */
    ticketStart: number | null;
    ticketEnd: number | null;
    drawDate: string | null;
  }[];
  payment: {
    method: "card" | "wallet";
    cardLast4: string | null;
    cardBrand: string | null;
  };
  reference: string;
  refund: { amountKobo: number; reason: string | null } | null;
};

export function getPurchase(kind: PurchaseKind, id: string) {
  return request<{ purchase: ApiReceipt }>(
    `/purchases/mine/${kind}/${encodeURIComponent(id)}`,
  );
}

// --- Notifications ---

export type NotificationType =
  | "wallet_funded"
  | "voucher_purchased"
  | "kyc_verified"
  | "listing_live"
  | "new_signup"
  | "prize_won"
  | "draw_result";

export type ApiNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  read: boolean;
  /** Type-specific ids, e.g. `listingId` or `winnerId`. */
  meta: Record<string, string> | null;
  createdAt: string;
};

export type NotificationsPage = {
  notifications: ApiNotification[];
  total: number;
  page: number;
  pages: number;
  unreadCount?: number;
};

export function getNotifications(page = 1, limit = 50) {
  return request<NotificationsPage>(
    `/notifications?page=${page}&limit=${limit}`,
  );
}

export function markNotificationRead(id: string) {
  return request<{ ok: boolean }>(
    `/notifications/${encodeURIComponent(id)}/read`,
    { method: "PATCH" },
  );
}

export function markAllNotificationsRead() {
  return request<{ ok: boolean }>("/notifications/read-all", {
    method: "POST",
  });
}

/** Send after sign-in and on every app start. Safe to repeat. */
export function registerPushDevice(token: string, platform: "ios" | "android") {
  return request<{ ok: boolean }>("/notifications/devices", {
    method: "POST",
    body: { token, platform },
  });
}

/** Call before signing out. */
export function unregisterPushDevice(token: string) {
  return request<{ ok: boolean }>("/notifications/devices/unregister", {
    method: "POST",
    body: { token },
  });
}

/** Saves (bookmarks) a listing, or removes it from saved. */
export function setListingSaved(id: string, saved: boolean) {
  return request<{ saved: boolean }>(
    `/listings/${encodeURIComponent(id)}/save`,
    { method: saved ? "POST" : "DELETE" },
  );
}
