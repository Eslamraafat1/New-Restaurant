"use client";

import { useSyncExternalStore } from "react";

export interface ToastItem { id: number; text: string }
let items: ToastItem[] = [];
let seq = 0;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());
const EMPTY: ToastItem[] = [];

export function toast(text: string) {
  const id = ++seq;
  items = [...items, { id, text }].slice(-3);
  emit();
  setTimeout(() => {
    items = items.filter((i) => i.id !== id);
    emit();
  }, 2800);
}

export function useToasts() {
  return useSyncExternalStore(
    (f) => { subs.add(f); return () => { subs.delete(f); }; },
    () => items,
    () => EMPTY,
  );
}
