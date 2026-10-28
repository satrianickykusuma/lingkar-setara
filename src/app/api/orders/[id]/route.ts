import { NextResponse } from "next/server";

import { hasStaffSession } from "@/server/auth/session";
import { getOrder, getOrderByCode, updateOrder } from "@/server/orders/order-repository";
import { parseStatusPatch } from "@/server/orders/order-schema";
import { readClipInventory } from "@/server/sign/clip-inventory";
import { compileSignPlan } from "@/server/sign/sign-compiler";

type Context = { params: Promise<{ id: string }> };

/**
 * `:id` accepts the internal UUID **or** the printed order code.
 *
 * The counter reads a code off the receipt, and the sign player is addressed by
 * code, so requiring a UUID here made the status buttons fail with a 404 even
 * though the screen had just loaded the order successfully.
 */
async function resolve(id: string) {
  const decoded = decodeURIComponent(id);
  return (await getOrder(decoded)) ?? (await getOrderByCode(decoded));
}

/** GET /api/orders/:id — the order plus its compiled sign plan. */
export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;
  const order = await resolve(id);
  if (!order) {
    return NextResponse.json(
      { error: "not_found", message: `Pesanan ${id} tidak ditemukan.` },
      { status: 404 },
    );
  }

  const inventory = await readClipInventory();
  const { plan, unmappedItems } = compileSignPlan(order, {
    available: inventory.videos,
    urls: inventory.videoUrl,
    posterUrls: inventory.posterUrl,
  });

  // Persist the plan id on first read so the order points at a stable plan.
  if (order.signPlanId !== `plan_${order.code}`) {
    await updateOrder(order.id, { signPlanId: `plan_${order.code}` });
  }

  return NextResponse.json({ order, plan, warnings: { unmappedItems } });
}

/** PATCH /api/orders/:id — advance the kitchen status. **Staff only.** */
export async function PATCH(request: Request, { params }: Context) {
  if (!(await hasStaffSession())) {
    return NextResponse.json(
      { error: "unauthorized", message: "Sesi kasir tidak ditemukan. Masuk dulu." },
      { status: 401 },
    );
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "Body harus berupa JSON." },
      { status: 400 },
    );
  }

  const parsed = parseStatusPatch(body);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: "validation_failed", errors: parsed.errors },
      { status: 422 },
    );
  }

  const existing = await resolve(id);
  if (!existing) {
    return NextResponse.json(
      { error: "not_found", message: `Pesanan ${id} tidak ditemukan.` },
      { status: 404 },
    );
  }

  const updated = await updateOrder(existing.id, { status: parsed.status });

  return NextResponse.json({ order: updated });
}
