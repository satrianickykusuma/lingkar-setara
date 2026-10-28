import { menuById, PORSI_MAX, PORSI_MIN } from "@/data/menu";
import type { NewOrder, OrderItem } from "@/server/orders/order-repository";

/**
 * Request validation for the order API.
 *
 * Hand-written rather than schema-library based: the project has no validation
 * dependency, and adding one for a handful of fields would be its only purpose.
 *
 * Two rules matter here beyond "is it the right type":
 *
 * 1. **Prices come from the catalogue, not the request.** The client sends what it
 *    is ordering; the server looks up the price. A tampered body cannot change what
 *    an item costs.
 * 2. **Choices are checked against the dish.** A drink cannot carry a chili choice
 *    and a fried dish cannot carry a temperature, because neither has a sign — the
 *    form does not offer them, and this rejects a request that tries anyway.
 */

export type ValidationError = { field: string; message: string };

export type ParsedOrder =
  | { ok: true; value: NewOrder }
  | { ok: false; errors: ValidationError[] };

const SERVINGS = new Set(["makan-sini", "bawa-pulang"]);
const PAYMENTS = new Set(["qris", "ewallet", "transfer", "cash"]);
const STATUSES = new Set([
  "baru",
  "dikonfirmasi",
  "disiapkan",
  "selesai",
  "dibatalkan",
]);

const MAX_ITEMS = 20;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asPorsi(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value)) return null;
  if (value < PORSI_MIN || value > PORSI_MAX) return null;
  return value;
}

export function parseOrderPayload(body: unknown): ParsedOrder {
  const errors: ValidationError[] = [];

  if (!isRecord(body)) {
    return { ok: false, errors: [{ field: "body", message: "Body harus berupa objek JSON." }] };
  }

  const service = asString(body.service);
  if (!SERVINGS.has(service)) {
    errors.push({
      field: "service",
      message: "Penyajian harus makan-sini atau bawa-pulang.",
    });
  }

  const payment = asString(body.payment);
  if (!PAYMENTS.has(payment)) {
    errors.push({
      field: "payment",
      message: "Pembayaran harus qris, ewallet, transfer, atau cash.",
    });
  }

  const customer = isRecord(body.customer) ? body.customer : {};
  const name = asString(customer.name);
  if (name.length < 2) {
    errors.push({ field: "customer.name", message: "Nama pemesan minimal 2 karakter." });
  }
  const phone = asString(customer.phone);
  if (phone !== "" && !/^[0-9+\-\s()]{9,20}$/.test(phone)) {
    errors.push({ field: "customer.phone", message: "Nomor telepon tidak lazim." });
  }

  const rawItems = Array.isArray(body.items) ? body.items : [];
  if (rawItems.length === 0) {
    errors.push({ field: "items", message: "Pesanan tidak boleh kosong." });
  }
  if (rawItems.length > MAX_ITEMS) {
    errors.push({ field: "items", message: `Maksimal ${MAX_ITEMS} baris per pesanan.` });
  }

  const items: OrderItem[] = [];
  rawItems.forEach((entry, index) => {
    if (!isRecord(entry)) {
      errors.push({ field: `items[${index}]`, message: "Baris pesanan tidak valid." });
      return;
    }

    const id = asString(entry.id);
    const item = menuById[id];
    if (!item) {
      // Rejecting an unknown id is also what stops the client inventing a price.
      errors.push({ field: `items[${index}].id`, message: `Hidangan "${id}" tidak ada di menu.` });
      return;
    }

    const porsi = asPorsi(entry.porsi);
    if (porsi === null) {
      errors.push({
        field: `items[${index}].porsi`,
        message: `Porsi harus bilangan bulat ${PORSI_MIN}–${PORSI_MAX}.`,
      });
      return;
    }

    const chiliRaw = asString(entry.chili);
    let chili: "pakai" | "tanpa" | undefined;
    if (chiliRaw !== "") {
      if (!item.options.chili) {
        errors.push({
          field: `items[${index}].chili`,
          message: `${item.name} tidak punya pilihan rica.`,
        });
        return;
      }
      if (chiliRaw !== "pakai" && chiliRaw !== "tanpa") {
        errors.push({ field: `items[${index}].chili`, message: "Rica harus pakai atau tanpa." });
        return;
      }
      chili = chiliRaw;
    } else if (item.options.chili) {
      // The form always sends a choice for food; defaulting keeps old clients valid.
      chili = "pakai";
    }

    const soyRaw = entry.soy;
    let soy: boolean | undefined;
    if (typeof soyRaw === "boolean") {
      if (!item.options.soy) {
        errors.push({
          field: `items[${index}].soy`,
          message: `${item.name} tidak punya pilihan kecap.`,
        });
        return;
      }
      soy = soyRaw;
    } else if (item.options.soy) {
      soy = false;
    }

    const temperatureRaw = asString(entry.temperature);
    let temperature: "dingin" | "hangat" | undefined;
    if (temperatureRaw !== "") {
      if (!item.options.temperature) {
        errors.push({
          field: `items[${index}].temperature`,
          message: `${item.name} tidak punya pilihan suhu.`,
        });
        return;
      }
      if (temperatureRaw !== "dingin" && temperatureRaw !== "hangat") {
        errors.push({
          field: `items[${index}].temperature`,
          message: "Suhu harus dingin atau hangat.",
        });
        return;
      }
      temperature = temperatureRaw;
    } else if (item.options.temperature) {
      temperature = "hangat";
    }

    items.push({
      id: item.id,
      name: item.name,
      code: item.code,
      porsi,
      unitPrice: item.price,
      lineTotal: item.price * porsi,
      chili,
      soy,
      temperature,
    });
  });

  const notes = asString(body.notes).slice(0, 400);
  const code = asString(body.code).slice(0, 24);

  if (errors.length > 0) return { ok: false, errors };

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const itemCount = items.reduce((sum, item) => sum + item.porsi, 0);

  return {
    ok: true,
    value: {
      code: code === "" ? generateFallbackCode() : code,
      service: service as NewOrder["service"],
      payment: payment as NewOrder["payment"],
      customer: { name, phone: phone === "" ? undefined : phone },
      notes: notes === "" ? undefined : notes,
      items,
      subtotal,
      // The vocabulary has no delivery or fee sign, so nothing is added on top.
      serviceFee: 0,
      total: subtotal,
      itemCount,
    },
  };
}

export function parseStatusPatch(body: unknown):
  | { ok: true; status: NewOrder["status"] }
  | { ok: false; errors: ValidationError[] } {
  if (!isRecord(body)) {
    return { ok: false, errors: [{ field: "body", message: "Body harus berupa objek JSON." }] };
  }
  const status = asString(body.status);
  if (!STATUSES.has(status)) {
    return {
      ok: false,
      errors: [
        { field: "status", message: `Status harus salah satu dari: ${[...STATUSES].join(", ")}.` },
      ],
    };
  }
  return { ok: true, status: status as NewOrder["status"] };
}

function generateFallbackCode(now = new Date()): string {
  const stamp = `${String(now.getDate()).padStart(2, "0")}${String(now.getMonth() + 1).padStart(2, "0")}`;
  return `LS-${stamp}-${Math.floor(Math.random() * 9000 + 1000)}`;
}
