import { NextResponse } from "next/server";

import {
  SESSION_COOKIE,
  hasStaffSession,
  issueSessionToken,
  isAuthConfigured,
  passwordMatches,
  sessionCookieOptions,
} from "@/server/auth/session";

/**
 * Staff sign-in.
 *
 * `POST` sets the signed session cookie, `GET` reports whether a session exists,
 * and `DELETE` signs out. All three return JSON so the login form can stay on the
 * page and show the error inline instead of navigating to an error screen.
 */

export async function GET() {
  return NextResponse.json({
    configured: isAuthConfigured(),
    signedIn: await hasStaffSession(),
  });
}

export async function POST(request: Request) {
  if (!isAuthConfigured()) {
    return NextResponse.json(
      {
        error: "not_configured",
        message:
          "KASIR_PASSWORD belum diatur. Isi di .env.local lalu jalankan ulang server.",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "Body harus berupa JSON." },
      { status: 400 },
    );
  }

  const candidate =
    typeof body === "object" && body !== null && "password" in body
      ? String((body as { password: unknown }).password ?? "")
      : "";

  if (candidate === "" || !passwordMatches(candidate)) {
    // A short delay takes the speed out of scripted guessing without locking
    // anyone out; a real deployment should also rate-limit by IP.
    await new Promise((resolve) => setTimeout(resolve, 600));
    return NextResponse.json(
      { error: "invalid_password", message: "Kata sandi kasir salah." },
      { status: 401 },
    );
  }

  const token = issueSessionToken();
  if (!token) {
    return NextResponse.json(
      { error: "not_configured", message: "Sesi tidak bisa dibuat." },
      { status: 503 },
    );
  }

  const response = NextResponse.json({ signedIn: true });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ signedIn: false });
  response.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
  return response;
}
