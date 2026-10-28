import { fileStorage } from "@/server/orders/storage/file-storage";
import { redisStorage } from "@/server/orders/storage/redis-storage";
import type { OrderStorage } from "@/server/orders/storage/types";

/**
 * Chooses where orders live.
 *
 * `ORDERS_STORAGE=redis` selects Redis (needed on serverless), anything else uses
 * the file. Instead of trusting that variable alone, the Redis configuration is also
 * checked: if someone sets `ORDERS_STORAGE=redis` but forgets the token, failing at
 * "no orders found" would be far more confusing than failing at startup.
 */

let cached: { storage: OrderStorage; reason: string } | null = null;

export function redisConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

export function orderStorage(): OrderStorage {
  if (cached) return cached.storage;

  const requested = (process.env.ORDERS_STORAGE ?? "").toLowerCase();

  if (requested === "redis") {
    if (!redisConfigured()) {
      // Loud, but not fatal: a missing config must not take the whole site down.
      console.error(
        "[orders] ORDERS_STORAGE=redis tetapi UPSTASH_REDIS_REST_URL/TOKEN kosong. " +
          "Pesanan akan disimpan ke berkas dan hilang di serverless.",
      );
      cached = { storage: fileStorage, reason: "redis diminta tetapi belum dikonfigurasi" };
      return cached.storage;
    }
    cached = { storage: redisStorage, reason: "ORDERS_STORAGE=redis" };
    return cached.storage;
  }

  cached = { storage: fileStorage, reason: "default" };
  return cached.storage;
}

/** For the diagnostic endpoint and the startup log. */
export function storageDescription(): { backend: "redis" | "file"; describe: string; reason: string } {
  const storage = orderStorage();
  return {
    backend: storage === redisStorage ? "redis" : "file",
    describe: storage.describe,
    reason: cached?.reason ?? "default",
  };
}
