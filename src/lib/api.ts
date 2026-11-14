// Vouccom API client. Docs: https://vouccom.com/api/docs

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
};

/** Calls the API and returns the parsed JSON. Throws ApiError on failure. */
export async function request<T>(
  path: string,
  { method = "GET", body, timeoutMs = TIMEOUT_MS }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    // Required for /auth/login to return a token instead of a cookie.
    "X-Client-Type": "mobile",
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

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
};

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

export function getMe(options: { timeoutMs?: number } = {}) {
  return request<{ user: User }>("/auth/me", options);
}

export function logout() {
  return request<{ ok: boolean }>("/auth/logout", { method: "POST" });
}
