import { openDB, type IDBPDatabase } from 'idb';
import type { TestResult } from '../types';

const DB_NAME = 'speedfox-db';
const DB_VERSION = 1;
const STORE_NAME = 'results';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp');
        }
      },
    });
  }
  return dbPromise;
}

export async function saveResult(result: TestResult): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, result);
}

export async function getAllResults(): Promise<TestResult[]> {
  const db = await getDB();
  const results = await db.getAllFromIndex(STORE_NAME, 'timestamp');
  return results.reverse(); // newest first
}

export async function getResultsByPeriod(hours: number): Promise<TestResult[]> {
  const db = await getDB();
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  const all = await db.getAllFromIndex(STORE_NAME, 'timestamp');
  return all.filter((r) => r.timestamp >= cutoff).reverse();
}

export async function clearAllResults(): Promise<void> {
  const db = await getDB();
  await db.clear(STORE_NAME);
}

export async function deleteResult(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}
