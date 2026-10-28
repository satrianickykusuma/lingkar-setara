import type { OrderRecord } from "@/server/orders/order-repository";
import type { OrderStorage } from "@/server/orders/storage/types";

/**
 * Redis storage over Upstash's REST API.
 *
 * This exists because serverless hosts have no writable disk. It deliberately uses
 * plain `fetch` instead of a Redis client: Upstash speaks HTTP, so there is no
 * dependency to install, no connection to keep alive, and it works in any runtime
 * (Node, serverless functions, edge).
 *
 * Layout: one hash, field = order id, value = the record as JSON. A shop has
 * hundreds of orders, not millions, so fetching the hash and filtering in memory is
 * fine and keeps the code obvious. If that ever changes, the fix belongs here.
 *
 * Configure with:
 *   ORDERS_STORAGE=redis
 *   UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io
 *   UPSTASH_REDIS_REST_TOKEN=xxxx
 *
 * Any Redis with the same REST shape works; Upstash is just the easiest to get.
 */

const HASH_KEY = "lingkar-setara:orders";

function config(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}

/** Runs one or more Redis commands through the REST pipeline endpoint. */
async function command<T = unknown>(payload: unknown[][]): Promise<T[]> {
  const connection = config();
  if (!connection) throw new Error("UPSTASH_REDIS_REST_URL/TOKEN belum diatur.");

  const response = await fetch(`${connection.url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${connection.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    // Orders must never be served from a fetch cache.
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Redis ${response.status}: ${text.slice(0, 200)}`);
  }

  const results = (await response.json()) as { result?: T; error?: string }[];
  const failed = results.find((entry) => entry.error);
  if (failed) throw new Error(`Redis: ${failed.error}`);
  return results.map((entry) => entry.result as T);
}

function isRecord(value: unknown): value is OrderRecord {
  return typeof value === "object" && value !== null && "id" in value && "code" in value;
}

/**
 * Upstash returns HGETALL as a flat `[field, value, field, value, …]` array.
 * Some deployments return an object instead, so both are handled.
 */
function parseHash(raw: unknown): OrderRecord[] {
  const out: OrderRecord[] = [];

  const push = (value: unknown) => {
    if (typeof value !== "string") return;
    try {
      const parsed: unknown = JSON.parse(value);
      if (isRecord(parsed)) out.push(parsed);
    } catch {
      // Skip a corrupt entry rather than failing the whole read.
    }
  };

  if (Array.isArray(raw)) {
    for (let index = 1; index < raw.length; index += 2) push(raw[index]);
  } else if (typeof raw === "object" && raw !== null) {
    for (const value of Object.values(raw as Record<string, unknown>)) push(value);
  }

  return out;
}

/** Insert order is not guaranteed by a hash, so newest-first is applied on read. */
function newestFirst(records: OrderRecord[]): OrderRecord[] {
  return [...records].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export const redisStorage: OrderStorage = {
  describe: `${HASH_KEY} (Upstash Redis)`,

  async list() {
    const [raw] = await command([["HGETALL", HASH_KEY]]);
    return newestFirst(parseHash(raw));
  },

  async get(id) {
    const [raw] = await command<string | null>([["HGET", HASH_KEY, id]]);
    if (typeof raw !== "string") return null;
    try {
      const parsed: unknown = JSON.parse(raw);
      return isRecord(parsed) ? parsed : null;
    } catch {
      return null;
    }
  },

  async save(record) {
    await command([["HSET", HASH_KEY, record.id, JSON.stringify(record)]]);
  },

  async remove(id) {
    const [removed] = await command<number>([["HDEL", HASH_KEY, id]]);
    return Number(removed) > 0;
  },

  async clear() {
    const records = await this.list();
    await command([["DEL", HASH_KEY]]);
    return records.length;
  },
};
