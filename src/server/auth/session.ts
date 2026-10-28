import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Staff session handling for the cashier area.
 *
 * Deliberately small: this is a single shared password for one shop, not a user
 * system. What it must do correctly is (a) never store the password in the cookie,
 * (b) sign the cookie so it cannot be forged, and (c) fail closed when no password
 * is configured — an unset variable must not mean "no login required".
 */

export const SESSION_COOKIE = "lingkar-setara:kasir";

/** How long a shift's session lasts before staff must sign in again. */
const SESSION_MS = 12 * 60 * 60 * 1000;

/**
 * The shop password. Set `KASIR_PASSWORD` in `.env.local`.
 *
 * No default: a hardcoded fallback would ship a known password, which is worse
 * than being locked out, because being locked out is noticed.
 */
function secret(): string | null {
  const password = process.env.KASIR_PASSWORD;
  return password && password.length > 0 ? password : null;
}

/** Secret used to sign the cookie. Falls back to the password itself. */
function signingKey(password: string): string {
  return process.env.KASIR_SESSION_SECRET ?? `lingkar-setara/${password}`;
}

export function isAuthConfigured(): boolean {
  return secret() !== null;
}

function sign(payload: string, password: string): string {
  return createHmac("sha256", signingKey(password)).update(payload).digest("hex");
}

/** `expiry.signature` — the password is never part of the cookie. */
function createToken(password: string, now = Date.now()): string {
  const expiry = String(now + SESSION_MS);
  return `${expiry}.${sign(expiry, password)}`;
}

function verifyToken(token: string, password: string, now = Date.now()): boolean {
  const [expiry, signature] = token.split(".");
  if (!expiry || !signature) return false;

  const expected = sign(expiry, password);
  // Constant-time compare; lengths must match before timingSafeEqual will run.
  const a = Buffer.from(signature, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  if (!timingSafeEqual(a, b)) return false;

  return Number(expiry) > now;
}

/** Checks a submitted password against the configured one. */
export function passwordMatches(candidate: string): boolean {
  const password = secret();
  if (password === null) return false;

  const a = Buffer.from(candidate, "utf8");
  const b = Buffer.from(password, "utf8");
  // Compare digests so differing lengths do not leak through early exit.
  const digestA = createHmac("sha256", "compare").update(a).digest();
  const digestB = createHmac("sha256", "compare").update(b).digest();
  return timingSafeEqual(digestA, digestB);
}

/** Reads the session from the request cookies. Safe in Server Components. */
export async function hasStaffSession(): Promise<boolean> {
  const password = secret();
  if (password === null) return false;

  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return false;

  return verifyToken(token, password);
}

/** Cookie options for the signed-in session. */
export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: Math.floor(SESSION_MS / 1000),
    // Secure only when actually served over HTTPS, otherwise the cookie would be
    // dropped on the shop's plain-HTTP LAN address.
    secure: (process.env.KASIR_COOKIE_SECURE ?? "false") === "true",
  };
}

export function issueSessionToken(): string | null {
  const password = secret();
  return password === null ? null : createToken(password);
}
