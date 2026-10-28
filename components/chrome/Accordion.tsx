"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useId, useState } from "react";
import { faqs } from "@/data/demo/content";
import { useI18n } from "@/lib/i18n";

export function Faq({ limit }: { limit?: number }) {
  const { l } = useI18n();
  const id = useId();
  const [open, setOpen] = useState<number | null>(0);
  const list = limit ? faqs.slice(0, limit) : faqs;
  return (
    <div className="divide-y divide-line border-y border-line">
      {list.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <h3>
              <button type="button" aria-expanded={isOpen} aria-controls={`${id}-p${i}`} id={`${id}-b${i}`} onClick={() => setOpen(isOpen ? null : i)}
                className="flex min-h-16 w-full items-center justify-between gap-4 py-4 text-start text-lg font-extrabold sm:text-xl">
                {l(f.q)}
                <motion.span animate={{ rotate: isOpen ? 45 : 0 }} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-line"><Plus size={18} aria-hidden /></motion.span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div id={`${id}-p${i}`} role="region" aria-labelledby={`${id}-b${i}`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <p className="max-w-3xl pb-5 text-soft">{l(f.a)}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
