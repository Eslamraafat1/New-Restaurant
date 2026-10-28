"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useI18n } from "@/lib/i18n";

type Side = "center" | "end" | "start" | "bottom";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Accessible dialog / drawer: portal, focus trap, Esc, scroll-lock, focus restore. */
export function Modal({
  open, onClose, label, side = "center", children, className = "", hideClose,
}: {
  open: boolean; onClose: () => void; label: string; side?: Side; children: ReactNode; className?: string; hideClose?: boolean;
}) {
  const { t, dir } = useI18n();
  const panel = useRef<HTMLDivElement>(null);
  const last = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    last.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const lenis = (window as unknown as { __lenis?: { stop(): void; start(): void } }).__lenis;
    lenis?.stop();
    const raf = requestAnimationFrame(() => {
      const el = panel.current?.querySelector<HTMLElement>("[data-autofocus]") ?? panel.current?.querySelector<HTMLElement>(FOCUSABLE);
      (el ?? panel.current)?.focus();
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.stopPropagation(); onClose(); return; }
      if (e.key !== "Tab" || !panel.current) return;
      const items = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0], lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
      else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      lenis?.start();
      last.current?.focus?.();
    };
  }, [open, onClose]);

  const rtl = dir === "rtl";
  const from =
    side === "end" ? { x: rtl ? "-100%" : "100%" } : side === "start" ? { x: rtl ? "100%" : "-100%" } : side === "bottom" ? { y: "100%" } : { y: 24, scale: 0.96 };
  const pos =
    side === "end" ? "end-0 top-0 h-dvh w-[min(26rem,100vw)] rounded-s-3xl"
    : side === "start" ? "start-0 top-0 h-dvh w-[min(22rem,90vw)] rounded-e-3xl"
    : side === "bottom" ? "inset-x-0 bottom-0 max-h-[88dvh] rounded-t-3xl"
    : "relative w-[min(100%,64rem)] max-h-[92dvh] rounded-3xl";

  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className={`fixed inset-0 z-[100] ${side === "center" ? "flex items-center justify-center p-3" : ""}`} key="modal-root">
          <motion.div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            ref={panel} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} data-lenis-prevent
            className={`${side === "center" ? "" : "absolute"} flex flex-col overflow-hidden border border-line bg-bg text-ink shadow-2xl ${pos} ${className}`}
            initial={{ ...from, opacity: side === "center" ? 0 : 1 }} animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            exit={{ ...from, opacity: side === "center" ? 0 : 1 }} transition={{ type: "spring", stiffness: 380, damping: 36 }}
          >
            {!hideClose && (
              <button type="button" onClick={onClose} aria-label={t("common.close")} className="icon-btn absolute end-3 top-3 z-10">
                <X size={18} aria-hidden />
              </button>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
