import { NextResponse } from "next/server";

import { getOrder, getOrderByCode } from "@/server/orders/order-repository";
import { readClipInventory } from "@/server/sign/clip-inventory";
import { compileSignPlan, vocabularyGaps } from "@/server/sign/sign-compiler";

type Context = { params: Promise<{ id: string }> };

/**
 * GET /api/isyarat/rencana/:id — the sign-language playback plan for an order.
 *
 * `:id` accepts either the internal id or the printed order code (`LS-…`), so the
 * counter can type what is written on the receipt.
 */
export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;
  const order = (await getOrder(id)) ?? (await getOrderByCode(id));

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

  return NextResponse.json({
    order: {
      id: order.id,
      code: order.code,
      status: order.status,
      service: order.service,
      payment: order.payment,
      customer: order.customer,
      itemCount: order.itemCount,
      total: order.total,
      createdAt: order.createdAt,
    },
    plan,
    // Reported so a missing recording is visible instead of looking like a bug.
    warnings: { unmappedItems, vocabularyGaps: vocabularyGaps() },
  });
}
