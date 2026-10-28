import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import type { OrderRecord } from "@/server/orders/order-repository";
import { collapseById, type OrderStorage } from "@/server/orders/storage/types";

/**
 * File-backed storage: one NDJSON file, written atomically.
 *
 * Right for a machine with its own disk. Writes are serialised through a promise
 * chain and land via a temp file + rename, so two concurrent submissions cannot
 * interleave or truncate the file.
 *
 * Not right for serverless — see `redis-storage.ts`.
 */

const DATA_DIR = path.join(process.cwd(), ".data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.ndjson");

let writeChain: Promise<unknown> = Promise.resolve();

function serialise<T>(task: () => Promise<T>): Promise<T> {
  const run = writeChain.then(task, task);
  writeChain = run.catch(() => undefined);
  return run;
}

async function readAll(): Promise<OrderRecord[]> {
  try {
    const raw = await readFile(ORDERS_FILE, "utf8");
    return raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .flatMap((line): OrderRecord[] => {
        try {
          const parsed: unknown = JSON.parse(line);
          return typeof parsed === "object" && parsed !== null && "id" in parsed
            ? [parsed as OrderRecord]
            : [];
        } catch {
          // A single corrupt line must not take the whole history down.
          return [];
        }
      });
  } catch {
    return [];
  }
}

async function writeAtomically(body: string): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  const temp = `${ORDERS_FILE}.${randomUUID()}.tmp`;
  await writeFile(temp, body, "utf8");
  // rename is atomic on the same volume, so a reader sees the old or the new file.
  await rename(temp, ORDERS_FILE);
}

export const fileStorage: OrderStorage = {
  describe: ORDERS_FILE,

  async list() {
    return collapseById(await readAll());
  },

  async get(id) {
    const current = collapseById(await readAll());
    return current.find((record) => record.id === id) ?? null;
  },

  async save(record) {
    await serialise(async () => {
      const current = collapseById(await readAll());
      const without = current.filter((entry) => entry.id !== record.id);
      // Append-only: the file keeps history, and the newest revision wins on read.
      const body = `${without.map((entry) => `${JSON.stringify(entry)}\n`).join("")}${JSON.stringify(record)}\n`;
      await writeAtomically(body);
    });
  },

  async remove(id) {
    return serialise(async () => {
      const current = collapseById(await readAll());
      if (!current.some((record) => record.id === id)) return false;
      await writeAtomically(
        current
          .filter((record) => record.id !== id)
          .map((record) => `${JSON.stringify(record)}\n`)
          .join(""),
      );
      return true;
    });
  },

  async clear() {
    return serialise(async () => {
      const current = collapseById(await readAll());
      await writeAtomically("");
      return current.length;
    });
  },
};
