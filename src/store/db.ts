import { openDB, type IDBPDatabase } from 'idb';
import type { TestResult } from '../types';

const DB_NAME = 'speedfox-db';
const DB_VERSION = 1;
const STORE_NAME = 'results';
const LS_KEY = 'speedfox-history-fallback';
const MAX_LS_RESULTS = 50;

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
    }).catch((err) => {
      // Reset so next call retries instead of staying on a rejected promise
      dbPromise = null;
      throw err;
    });
  }
  return dbPromise;
}

// ─── localStorage fallback helpers ───────────────────────────────────

function lsRead(): TestResult[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TestResult[];
  } catch {
    return [];
  }
}

function lsWrite(results: TestResult[]): void {
  try {
    // Keep only the newest MAX_LS_RESULTS entries
    const trimmed = results.slice(0, MAX_LS_RESULTS);
    localStorage.setItem(LS_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.warn('[SpeedFox] localStorage write failed:', err);
  }
}

function lsAppend(result: TestResult): void {
  const existing = lsRead();
  lsWrite([result, ...existing]);
}

function lsClear(): void {
  try {
    localStorage.removeItem(LS_KEY);
  } catch { /* ignore */ }
}

// ─── Public API (dual-write: IndexedDB primary + localStorage backup) ─

export async function saveResult(result: TestResult): Promise<void> {
  // Always write to localStorage backup (fast, synchronous, reliable)
  lsAppend(result);

  // Then try IndexedDB
  try {
    const db = await getDB();
    await db.put(STORE_NAME, result);
  } catch (err) {
    console.warn('[SpeedFox] IndexedDB saveResult failed, localStorage backup used:', err);
  }
}

export async function getAllResults(): Promise<TestResult[]> {
  try {
    const db = await getDB();
    const results = await db.getAllFromIndex(STORE_NAME, 'timestamp');
    const idbResults = results.reverse(); // newest first

    if (idbResults.length > 0) {
      // IDB has data → sync to localStorage as backup
      lsWrite(idbResults);
      return idbResults;
    }

    // IDB empty → check localStorage fallback
    const lsResults = lsRead();
    if (lsResults.length > 0) {
      console.info('[SpeedFox] Rehydrating IndexedDB from localStorage backup (%d results)', lsResults.length);
      // Rehydrate IDB from localStorage
      for (const r of lsResults) {
        try {
          await db.put(STORE_NAME, r);
        } catch { /* best effort */ }
      }
      return lsResults;
    }

    return [];
  } catch (err) {
    console.warn('[SpeedFox] IndexedDB getAllResults failed, falling back to localStorage:', err);
    return lsRead();
  }
}

export async function getResultsByPeriod(hours: number): Promise<TestResult[]> {
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  try {
    const db = await getDB();
    const all = await db.getAllFromIndex(STORE_NAME, 'timestamp');
    return all.filter((r) => r.timestamp >= cutoff).reverse();
  } catch (err) {
    console.warn('[SpeedFox] IndexedDB getResultsByPeriod failed, using localStorage:', err);
    return lsRead().filter((r) => r.timestamp >= cutoff);
  }
}

export async function clearAllResults(): Promise<void> {
  lsClear();
  try {
    const db = await getDB();
    await db.clear(STORE_NAME);
  } catch (err) {
    console.warn('[SpeedFox] IndexedDB clearAllResults failed:', err);
  }
}

export async function deleteResult(id: string): Promise<void> {
  // Remove from localStorage backup
  const lsResults = lsRead();
  lsWrite(lsResults.filter((r) => r.id !== id));

  try {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
  } catch (err) {
    console.warn('[SpeedFox] IndexedDB deleteResult failed:', err);
  }
}
