import { useEffect, useState } from "react";

const DB_NAME = "stage-light-db";
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("keyval")) {
        db.createObjectStore("keyval");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getIdb<T>(key: string): Promise<T | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("keyval", "readonly");
    const req = tx.objectStore("keyval").get(key);
    req.onsuccess = () => resolve((req.result as T) ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function setIdb<T>(key: string, value: T): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("keyval", "readwrite");
    tx.objectStore("keyval").put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * IndexedDB 持久化 hook。数据存在浏览器本地，刷新不丢失。
 */
export function useIndexedDbStore<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getIdb<T>(key).then((stored) => {
      if (!cancelled && stored !== null) {
        setValue(stored);
      }
      if (!cancelled) setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  const persist = (next: T) => {
    setValue(next);
    void setIdb(key, next);
  };

  return { value, setValue: persist, loaded };
}
