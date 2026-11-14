// Everything the app needs to talk to the Vouccom backend.
// See the API docs at https://vouccom.com/api/docs

// ---------------------------------------------------------------------------
// Where the server is
// ---------------------------------------------------------------------------

/** Base address of the API. Set in .env; the fallback keeps the app working without it. */
export const API_URL = process.env.EXPO_PUBLIC_API_URL;

/** Give up on a request after this long, so the app never waits forever. */
const TIMEOUT_MS = 20_000;

// ---------------------------------------------------------------------------
// The sign-in token
// ---------------------------------------------------------------------------

// Held in memory for now. Step 4 (sign-in) will also save it securely on the phone.
let authToken: string | null = null;

/** Remember the token from POST /auth/login, or pass null when signing out. */
export function setAuthToken(token: string | null) {
  authToken = token;
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

/**
 * Thrown for every failed request. `message` is safe to show the user.
 * `code` lets the app react to specific cases, e.g. "INSUFFICIENT_FUNDS".
 */
export class ApiError extends Error {
  code: string;
  /** HTTP status, or 0 when the server couldn't be reached at all. */
  status: number;
  /** Quote this when reporting a problem to the backend team. */
  requestId?: string;
  /** Field-by-field problems, sent with VALIDATION_FAILED. */
  details?: unknown;
  /** For 429 (rate limited): seconds to wait before trying again. */
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

// ---------------------------------------------------------------------------
// The one function every API call goes through
// ---------------------------------------------------------------------------

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  /** Sent as JSON. */
  body?: unknown;
  /** Give up after this many milliseconds. Defaults to TIMEOUT_MS. */
  timeoutMs?: number;
};

/**
 * Calls the API and returns the JSON reply, typed as T.
 * Throws an ApiError when anything goes wrong.
 *
 *   const { user } = await request<{ user: User }>("/auth/me");
 */
export async function request<T>(
  path: string,
  { method = "GET", body, timeoutMs = TIMEOUT_MS }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    // Tells the server we're the mobile app, so login returns a token.
    "X-Client-Type": "mobile",
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  // Cancel the request if it takes too long.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    // No reply at all: offline, the server is down, or we gave up waiting.
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

  // Some replies have no body (e.g. 204 No Content).
  const text = await response.text();
  const data = text ? safeJsonParse(text) : undefined;

  if (!response.ok) {
    const error = (data as { error?: Partial<ErrorBody> } | undefined)?.error;
    const retryAfter = Number(response.headers.get("Retry-After"));
    throw new ApiError(
      error?.message ?? `Something went wrong (status ${response.status}).`,
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

/** The shape of every error reply, from the API docs. */
type ErrorBody = {
  code: string;
  message: string;
  requestId: string;
  details?: unknown;
};

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export type Health = {
  status: string;
  uptime: number;
  db: string;
};

/** GET /health: is the server up and connected to its database? */
export function checkHealth() {
  return request<Health>("/health");
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export type KycStatus =
  "unverified" | "pending" | "verified" | "rejected" | "resubmit_required";

/** The signed-in user, as the API describes it (the `User` schema). */
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
};

/** POST /auth/login. The token only comes back because we send X-Client-Type: mobile. */
export function login(email: string, password: string) {
  return request<{ user: User; token?: string }>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

/** GET /auth/me: who does the current token belong to? */
export function getMe(options: { timeoutMs?: number } = {}) {
  return request<{ user: User }>("/auth/me", options);
}

/** POST /auth/logout: ends this session on the server. Safe to call when signed out. */
export function logout() {
  return request<{ ok: boolean }>("/auth/logout", { method: "POST" });
}
