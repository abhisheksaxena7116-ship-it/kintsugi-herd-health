/**
 * Tiny IndexedDB wrapper for offline persistence (no dependencies).
 * Stores: cases (all cases incl. pending), kv (misc app state).
 */
const DB_NAME = "kintsugi-care";
const DB_VERSION = 1;

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") return reject(new Error("IndexedDB unavailable"));
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("cases")) db.createObjectStore("cases", { keyPath: "id" });
      if (!db.objectStoreNames.contains("kv")) db.createObjectStore("kv");
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T> | void): Promise<T | undefined> {
  try {
    const db = await open();
    return await new Promise<T | undefined>((resolve, reject) => {
      const t = db.transaction(store, mode);
      const s = t.objectStore(store);
      const req = fn(s);
      let result: T | undefined;
      if (req) req.onsuccess = () => { result = req.result; };
      t.oncomplete = () => resolve(result);
      t.onerror = () => reject(t.error);
    });
  } catch {
    return undefined;
  }
}

export const db = {
  getAll<T>(store: string) {
    return tx<T[]>(store, "readonly", (s) => s.getAll() as IDBRequest<T[]>);
  },
  put<T>(store: string, value: T, key?: IDBValidKey) {
    return tx(store, "readwrite", (s) => (key !== undefined ? s.put(value, key) : s.put(value)));
  },
  get<T>(store: string, key: IDBValidKey) {
    return tx<T>(store, "readonly", (s) => s.get(key) as IDBRequest<T>);
  },
  delete(store: string, key: IDBValidKey) {
    return tx(store, "readwrite", (s) => s.delete(key));
  },
  clear(store: string) {
    return tx(store, "readwrite", (s) => s.clear());
  },
};

/** Fallback for environments without IndexedDB (SSR / old browsers). */
export const localKv = {
  get<T>(key: string, fallback: T): T {
    if (typeof localStorage === "undefined") return fallback;
    try {
      const raw = localStorage.getItem(`kc:${key}`);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown) {
    if (typeof localStorage === "undefined") return;
    try { localStorage.setItem(`kc:${key}`, JSON.stringify(value)); } catch { /* quota */ }
  },
};
