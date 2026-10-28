import { NextResponse } from "next/server";

import { hasStaffSession } from "@/server/auth/session";
import {
  createOrder,
  deleteAllOrders,
  deleteOrder,
  listOrders,
  ordersFilePath,
} from "@/server/orders/order-repository";
import { parseOrderPayload } from "@/server/orders/order-schema";
import { readClipInventory } from "@/server/sign/clip-inventory";
import { compileSignPlan, vocabularyGaps } from "@/server/sign/sign-compiler";

/**
 * POST /api/orders — record a placed order and compile its sign-language plan.
 *
 * Returns the plan along with any configuration gap — a dish whose recording is
 * missing — so the counter sees exactly what will not be signed instead of
 * discovering it at playback time.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "Body harus berupa JSON." },
      { status: 400 },
    );
  }

  const parsed = parseOrderPayload(body);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: "validation_failed", errors: parsed.errors },
      { status: 422 },
    );
  }

  const record = await createOrder(parsed.value);

  // Read the clip folder so the response already reflects which segments are
  // playable; otherwise a freshly created order would claim everything is
  // pending even when recordings exist.
  const inventory = await readClipInventory();
  const { plan, unmappedItems } = compileSignPlan(record, {
    available: inventory.videos,
    urls: inventory.videoUrl,
    posterUrls: inventory.posterUrl,
  });

  // Configuration gaps are reported, not thrown: the order is still valid.
  const gaps = vocabularyGaps().map((gap) => gap.dishId);

  return NextResponse.json(
    {
      order: record,
      plan,
      warnings: {
        unmappedItems: [...new Set([...unmappedItems, ...gaps])],
        pendingClips: plan.pendingCount,
      },
    },
    { status: 201 },
  );
}

/**
 * GET /api/orders — recent orders, newest first. **Staff only.**
 *
 * This lists every order with the guest's name and phone number, so it is not a
 * public endpoint even though placing an order (`POST`) is.
 */
export async function GET(request: Request) {
  if (!(await hasStaffSession())) {
    return NextResponse.json(
      { error: "unauthorized", message: "Sesi kasir tidak ditemukan. Masuk dulu." },
      { status: 401 },
    );
  }

  const limit = Number(new URL(request.url).searchParams.get("limit") ?? "20");
  const orders = await listOrders(Number.isFinite(limit) ? Math.min(100, Math.max(1, limit)) : 20);
  return NextResponse.json({
    count: orders.length,
    store: ordersFilePath(),
    orders,
  });
}

/**
 * DELETE /api/orders — clears the store, or removes one order with `?id=`.
 * **Staff only**: this erases order history.
 */
export async function DELETE(request: Request) {
  if (!(await hasStaffSession())) {
    return NextResponse.json(
      { error: "unauthorized", message: "Sesi kasir tidak ditemukan. Masuk dulu." },
      { status: 401 },
    );
  }

  const id = new URL(request.url).searchParams.get("id");

  if (id) {
    const removed = await deleteOrder(decodeURIComponent(id));
    if (!removed) {
      return NextResponse.json(
        { error: "not_found", message: `Pesanan ${id} tidak ditemukan.` },
        { status: 404 },
      );
    }
    return NextResponse.json({ removed: 1, id });
  }

  const count = await deleteAllOrders();
  return NextResponse.json({ removed: count, cleared: true });
}
