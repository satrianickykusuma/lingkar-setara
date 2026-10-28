import { NextResponse } from "next/server";

import { hasStaffSession } from "@/server/auth/session";
import { readQueueSummary } from "@/server/sign/queue";

export const dynamic = "force-dynamic";

/**
 * GET /api/kasir/antrean — the cashier feed. **Staff only.**
 *
 * Returns the orders still waiting to be prepared (newest first) plus a `next`
 * pointer: the order the counter screen should be showing right now.
 *
 * `since` is an ISO timestamp — the newest order the screen has already played.
 * Passing it turns this into a long-poll that resolves as soon as a newer order
 * arrives, so the screen reacts to a submission instead of being polled on a
 * timer. Omitting it returns the current snapshot immediately.
 */

/** How long a long-poll waits before falling back to a plain snapshot. */
const WAIT_MS = 20_000;
const POLL_MS = 1_200;

export async function GET(request: Request) {
  // The queue contains every waiting order and the name of each guest, so it is
  // not public: without this check any visitor could read the day's orders.
  if (!(await hasStaffSession())) {
    return NextResponse.json(
      { error: "unauthorized", message: "Sesi kasir tidak ditemukan. Masuk dulu." },
      { status: 401 },
    );
  }

  const since = new URL(request.url).searchParams.get("since");
  const sinceTime = since ? Date.parse(since) : Number.NaN;

  // Snapshot mode.
  if (Number.isNaN(sinceTime)) {
    return NextResponse.json(await readQueueSummary());
  }

  const deadline = Date.now() + WAIT_MS;
  while (Date.now() < deadline) {
    const current = await readQueueSummary();
    const newest = current.queue[0];
    if (newest && Date.parse(newest.createdAt) > sinceTime) {
      return NextResponse.json(current);
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  }

  // Nothing new within the window. The caller still gets the state so it can
  // refresh its "waiting" indicator; silence is not an error.
  return NextResponse.json(await readQueueSummary());
}
