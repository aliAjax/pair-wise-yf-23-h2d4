import { useEffect, useState } from "react";

/**
 * 本地 IndexedDB 风格持久化（纯前端无第三方服务）：
 * 这里用 localStorage 承载同一份 JSON 数据，接口模拟异步 store 读写。
 */
export function useIndexedDbStore<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // 容量受限时忽略，内存态仍可评审功能
    }
  }, [key, value]);

  return { value, setValue };
}
