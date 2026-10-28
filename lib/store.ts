"use client";

import { useSyncExternalStore } from "react";

/**
 * Tiny localStorage-backed external store. The server snapshot is always `initial`,
 * so hydration never mismatches; the persisted value is swapped in right after hydration.
 */
export function createStore<T>(key: string, initial: T, persist = true) {
  let value = initial;
  let loaded = false;
  const subs = new Set<() => void>();

  const load = () => {
    if (loaded || !persist || typeof window === "undefined") return;
    loaded = true;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) value = JSON.parse(raw) as T;
    } catch {
      /* storage unavailable or corrupt – keep initial */
    }
  };
  const emit = () => subs.forEach((f) => f());

  const get = () => {
    load();
    return value;
  };
  const server = () => initial;
  const subscribe = (f: () => void) => {
    subs.add(f);
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      try {
        value = e.newValue ? (JSON.parse(e.newValue) as T) : initial;
      } catch {
        value = initial;
      }
      emit();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      subs.delete(f);
      window.removeEventListener("storage", onStorage);
    };
  };

  return {
    get,
    set(next: T | ((prev: T) => T)) {
      load();
      value = typeof next === "function" ? (next as (p: T) => T)(value) : next;
      if (persist) {
        try {
          window.localStorage.setItem(key, JSON.stringify(value));
        } catch {
          /* ignore quota / privacy mode */
        }
      }
      emit();
    },
    use: () => useSyncExternalStore(subscribe, get, server),
  };
}
