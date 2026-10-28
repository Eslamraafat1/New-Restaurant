"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useId, type ReactNode } from "react";
import type { Config } from "@/lib/api/types";

export type ToppingKind = "pepperoni" | "mushroom" | "olive" | "pepper" | "onion" | "basil";
export const TOPPING_KINDS: ToppingKind[] = ["pepperoni", "mushroom", "olive", "pepper", "onion", "basil"];

export interface PizzaLayers {
  sauce: "marinara" | "ranch" | "bbq" | "pesto";
  cheese: "regular" | "extra";
  crust: "classic" | "thin" | "sourdough" | "stuffed";
  /** 0 = absent, 1 = normal amount, 2 = normal + extra */
  toppings: Record<ToppingKind, 0 | 1 | 2>;
  hot: boolean;
}

/** Maps a product configuration to visual layers – the single source of truth for the preview. */
export function configToLayers(config: Config): PizzaLayers {
  const sel = config.toppings ?? [];
  const ex = config.extras ?? [];
  const lvl = (k: ToppingKind, xid?: string): 0 | 1 | 2 => {
    const base = sel.includes(k);
    const extra = xid ? ex.includes(xid) : false;
    if (base && extra) return 2;
    if (extra) return 2;
    return base ? 1 : 0;
  };
  return {
    sauce: (config.sauce?.[0] as PizzaLayers["sauce"]) ?? "marinara",
    cheese: (config.cheese?.[0] as PizzaLayers["cheese"]) ?? "regular",
    crust: (config.crust?.[0] as PizzaLayers["crust"]) ?? "classic",
    toppings: {
      pepperoni: lvl("pepperoni", "x-pepperoni"),
      mushroom: lvl("mushroom", "x-mushroom"),
      olive: lvl("olive", "x-olive"),
      pepper: lvl("pepper"),
      onion: lvl("onion"),
      basil: lvl("basil"),
    },
    hot: (config.spice ?? []).includes("hot"),
  };
}

export const FULL_LAYERS: PizzaLayers = {
  sauce: "marinara", cheese: "regular", crust: "classic", hot: false,
  toppings: { pepperoni: 1, mushroom: 1, olive: 1, pepper: 1, onion: 0, basil: 1 },
};

/* ── slot geometry: a fixed, deterministic set of positions per topping. Base items use even slots, extras odd. ── */
const GOLDEN = 2.399963;
const CFG: Record<ToppingKind, { slots: number; base: number; offset: number; reach: number }> = {
  pepperoni: { slots: 18, base: 9, offset: 0.2, reach: 146 },
  mushroom: { slots: 14, base: 7, offset: 1.3, reach: 142 },
  olive: { slots: 20, base: 10, offset: 2.4, reach: 148 },
  pepper: { slots: 12, base: 6, offset: 3.5, reach: 144 },
  onion: { slots: 12, base: 6, offset: 4.6, reach: 140 },
  basil: { slots: 8, base: 6, offset: 5.7, reach: 134 },
};

export function slotPos(kind: ToppingKind, slot: number) {
  const c = CFG[kind];
  const r = c.reach * Math.sqrt((slot + 0.5) / c.slots);
  const a = slot * GOLDEN + c.offset;
  return { x: 200 + r * Math.cos(a), y: 200 + r * Math.sin(a), rot: (slot * 67 + c.offset * 40) % 360 };
}
/** Slot indexes that are visible for a given level. */
export function slotsFor(kind: ToppingKind, level: 0 | 1 | 2): number[] {
  const c = CFG[kind];
  if (!level) return [];
  const out: number[] = [];
  const baseSlots = Array.from({ length: c.base }, (_, i) => i * 2 + 0);
  const extraSlots = Array.from({ length: c.slots - c.base }, (_, i) => i * 2 + 1).filter((s) => s < c.slots);
  out.push(...baseSlots.filter((s) => s < c.slots));
  if (level === 2 && kind !== "basil") out.push(...extraSlots);
  return out;
}
export const slotCount = (k: ToppingKind) => CFG[k].slots;

/* ── toppings drawn at origin ── */
export function ToppingShape({ kind }: { kind: ToppingKind }) {
  switch (kind) {
    case "pepperoni":
      return (
        <g>
          <circle r="19" fill="#9f2216" />
          <circle r="17" fill="#c3321f" />
          <circle cx="-6" cy="-5" r="2.4" fill="#8a1c12" />
          <circle cx="7" cy="-2" r="2" fill="#8a1c12" />
          <circle cx="1" cy="8" r="2.6" fill="#8a1c12" />
          <path d="M-11-8a14 14 0 0 1 9-6" stroke="#e0644a" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity=".7" />
        </g>
      );
    case "mushroom":
      return (
        <path d="M-17 5C-17-15 17-15 17 5C17 8 12 8 7 8L7 17C7 19 5 20 3 20L-3 20C-5 20-7 19-7 17L-7 8C-12 8-17 8-17 5Z"
          fill="#e4d2b0" stroke="#a58a64" strokeWidth="2" strokeLinejoin="round" />
      );
    case "olive":
      return <circle r="6.5" fill="none" stroke="#2a2331" strokeWidth="4.6" />;
    case "pepper":
      return <path d="M-15 4A15 15 0 0 1 15 4" fill="none" stroke="#4f9d2c" strokeWidth="6" strokeLinecap="round" />;
    case "onion":
      return (
        <g fill="none" strokeLinecap="round">
          <path d="M-13 3A13 13 0 0 1 13 3" stroke="#c985a8" strokeWidth="3.4" />
          <path d="M-8 3A8 8 0 0 1 8 3" stroke="#e6bfd2" strokeWidth="2.6" />
        </g>
      );
    case "basil":
      return (
        <g>
          <path d="M0-17C13-9 13 9 0 17C-13 9-13-9 0-17Z" fill="#3f8a2b" stroke="#2c6a1c" strokeWidth="1.4" />
          <path d="M0-14V15M0-4L6-9M0 3L-6-2" stroke="#8fd16a" strokeWidth="1.3" strokeLinecap="round" fill="none" />
        </g>
      );
  }
}

const SAUCE_COLOR: Record<PizzaLayers["sauce"], string> = {
  marinara: "#c93a20", ranch: "#d03b21", bbq: "#6a2e17", pesto: "#6f9d3a",
};

/** cheese patches (fixed layout) */
const PATCHES = Array.from({ length: 30 }, (_, i) => {
  const r = 150 * Math.sqrt((i + 0.5) / 30);
  const a = i * GOLDEN * 1.7;
  return { x: 200 + r * Math.cos(a), y: 200 + r * Math.sin(a), rx: 26 + ((i * 7) % 12), ry: 20 + ((i * 5) % 10), rot: (i * 53) % 180 };
});
const FLAKES = Array.from({ length: 34 }, (_, i) => {
  const r = 152 * Math.sqrt((i + 0.5) / 34);
  const a = i * 2.1 + 0.4;
  return { x: 200 + r * Math.cos(a), y: 200 + r * Math.sin(a), rot: (i * 41) % 180 };
});

export interface PizzaSVGProps {
  layers?: PizzaLayers;
  /** "motion" animates layer changes (customiser). "plain" renders static groups for GSAP timelines. */
  mode?: "motion" | "plain";
  className?: string;
  title?: string;
  /** when set, a real photograph is the base (sauce/cheese/dough vectors are skipped) and chips are real cut-outs */
  photo?: string;
}

/** Real photographic cut-outs (public/img/cut) used as topping pieces in photo mode. */
const CHIPS: Partial<Record<ToppingKind, { files: string[]; size: number }>> = {
  pepperoni: { files: ["pep1", "pep2", "pep3"], size: 42 },
  mushroom: { files: ["mush1"], size: 34 },
  olive: { files: ["olive1", "olive2"], size: 24 },
  basil: { files: ["basil1", "basil2", "basil3"], size: 50 },
};

function Chip({ kind, slot }: { kind: ToppingKind; slot: number }) {
  const c = CHIPS[kind];
  if (!c) return <ToppingShape kind={kind} />;
  const s = c.size;
  return <image href={`/img/cut/${c.files[slot % c.files.length]}.png`} x={-s / 2} y={-s / 2} width={s} height={s} style={{ filter: "drop-shadow(0 2px 2px rgba(40,10,0,.45))" }} />;
}

export function PizzaSVG({ layers = FULL_LAYERS, mode = "motion", className, title, photo }: PizzaSVGProps) {
  const uid = useId().replace(/:/g, "");
  const motionMode = mode === "motion";
  const inner = layers.crust === "thin" ? 176 : layers.crust === "stuffed" ? 160 : 166;
  const patches = layers.cheese === "extra" ? PATCHES : PATCHES.slice(0, 17);

  return (
    <svg viewBox="0 0 400 400" className={className} role="img" aria-label={title ?? "Pizza"}>
      <defs>
        <radialGradient id={`crust-${uid}`} cx="50%" cy="45%" r="60%">
          <stop offset="70%" stopColor="#e6ac52" />
          <stop offset="100%" stopColor="#b86d25" />
        </radialGradient>
        <radialGradient id={`dough-${uid}`}>
          <stop offset="0%" stopColor="#f3d391" />
          <stop offset="100%" stopColor="#e2a850" />
        </radialGradient>
        <clipPath id={`sc-${uid}`}>
          {motionMode ? (
            <motion.circle key={layers.sauce} cx="200" cy="200" initial={{ r: 0 }} animate={{ r: inner + 2 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} />
          ) : (
            <circle data-l="sauce-clip" cx="200" cy="200" r={inner + 2} />
          )}
        </clipPath>
        <clipPath id={`pz-${uid}`}>
          <circle cx="200" cy="200" r={inner} />
        </clipPath>
      </defs>

      <ellipse cx="206" cy="214" rx="192" ry="186" fill="#000" opacity=".16" />

      {photo ? (
        <g data-l="photo">
          <clipPath id={`ph-${uid}`}><circle cx="200" cy="200" r="190" /></clipPath>
          <image href={photo} x="-45" y="-45" width="490" height="490" preserveAspectRatio="xMidYMid slice" clipPath={`url(#ph-${uid})`} />
          {layers.cheese === "extra" && (
            <g clipPath={`url(#ph-${uid})`}>{FLAKES.map((f, i) => <rect key={i} x={f.x - 8} y={f.y - 1.6} width="16" height="3.2" rx="1.6" fill="#fff3c4" opacity=".92" transform={`rotate(${f.rot} ${f.x} ${f.y})`} style={{ filter: "drop-shadow(0 1px 1px rgba(60,30,0,.5))" }} />)}</g>
          )}
          <circle cx="200" cy="200" r="190" fill="none" stroke="#000" strokeOpacity=".12" strokeWidth="2" />
        </g>
      ) : (
        <>
      {/* dough + crust */}
      <g data-l="dough">
        <circle cx="200" cy="200" r="192" fill={`url(#crust-${uid})`} />
        {Array.from({ length: 22 }, (_, i) => {
          const a = (i / 22) * Math.PI * 2;
          return <circle key={i} cx={200 + 181 * Math.cos(a)} cy={200 + 181 * Math.sin(a)} r={4 + (i % 3)} fill={layers.crust === "sourdough" ? "#7a4318" : "#a85f20"} opacity=".55" />;
        })}
        {layers.crust === "stuffed" &&
          Array.from({ length: 18 }, (_, i) => {
            const a = (i / 18) * Math.PI * 2;
            return <circle key={i} cx={200 + 176 * Math.cos(a)} cy={200 + 176 * Math.sin(a)} r="5.5" fill="#f9e5a3" opacity=".85" />;
          })}
        <circle cx="200" cy="200" r={inner} fill={`url(#dough-${uid})`} />
      </g>

      {/* sauce */}
      <g clipPath={`url(#sc-${uid})`} data-l="sauce">
        <circle cx="200" cy="200" r={inner} fill={SAUCE_COLOR[layers.sauce]} />
        <circle cx="200" cy="200" r={inner - 10} fill="none" stroke="#000" strokeOpacity=".08" strokeWidth="10" />
      </g>

      {/* cheese */}
      <g clipPath={`url(#pz-${uid})`} data-l="cheese">
        {patches.map((p, i) => (
          <ellipse key={i} className="cp" cx={p.x} cy={p.y} rx={p.rx} ry={p.ry} transform={`rotate(${p.rot} ${p.x} ${p.y})`}
            fill={layers.cheese === "extra" ? "#f7d878" : "#f6e0a0"} opacity=".94" />
        ))}
        {patches.map((p, i) => i % 3 === 0 && (
          <ellipse key={`g${i}`} className="cp" cx={p.x + 4} cy={p.y - 3} rx={p.rx * 0.45} ry={p.ry * 0.4} fill="#e8a93a" opacity=".5" />
        ))}
        {layers.cheese === "extra" && (
          <g>
            {FLAKES.map((f, i) => (
              <rect key={i} className="cp" x={f.x - 7} y={f.y - 1.5} width="14" height="3" rx="1.5" fill="#fff0b8" transform={`rotate(${f.rot} ${f.x} ${f.y})`} />
            ))}
          </g>
        )}
      </g>

        </>
      )}

      {/* toppings – each kind is its own group so it can be revealed/removed independently */}
      {TOPPING_KINDS.map((kind) => {
        const slots = slotsFor(kind, layers.toppings[kind]);
        return (
          <g key={kind} data-l={kind}>
            <AnimatePresence initial={false}>
              {slots.map((s, idx) => {
                const p = slotPos(kind, s);
                return (
                  <g key={`${kind}-${s}`} transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.rot.toFixed(0)})`}>
                    <Piece motionMode={motionMode} delay={idx * 0.025}>
                      {photo ? <Chip kind={kind} slot={s} /> : <ToppingShape kind={kind} />}
                    </Piece>
                  </g>
                );
              })}
            </AnimatePresence>
          </g>
        );
      })}

      {/* surface drizzles & flakes */}
      <AnimatePresence>
        {layers.sauce === "ranch" && (
          <motion.path key="ranch" data-l="drizzle" d={drizzle(5)} fill="none" stroke="#fffaf0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,.45))" }}
            opacity=".92" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9, ease: "easeOut" }} />
        )}
        {layers.sauce === "bbq" && (
          <motion.path key="bbq" data-l="drizzle" d={drizzle(5)} fill="none" stroke="#4a1f0e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
            opacity=".85" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9, ease: "easeOut" }} />
        )}
        {photo && layers.sauce === "pesto" && (
          <motion.path key="pesto" data-l="drizzle" d={drizzle(5)} fill="none" stroke="#5f9230" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" opacity=".9" style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,.4))" }} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9, ease: "easeOut" }} />
        )}
        {layers.hot && (
          <motion.g key="hot" data-l="chili" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {FLAKES.map((f, i) => (
              <ellipse key={i} cx={f.x + 6} cy={f.y + 4} rx="4" ry="1.8" fill={i % 2 ? "#e0381c" : "#f0642a"} transform={`rotate(${f.rot * 2} ${f.x} ${f.y})`} />
            ))}
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}

function Piece({ children, delay = 0, motionMode }: { children: ReactNode; delay?: number; motionMode: boolean }) {
  return motionMode ? (
    <motion.g
      initial={{ scale: 0, opacity: 0, y: -50 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0, opacity: 0, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 380, damping: 18, delay }}
    >
      {children}
    </motion.g>
  ) : (
    <g className="pc">{children}</g>
  );
}

function drizzle(rows: number): string {
  // flowing, thin sauce lines: each row is a gentle S-curve, rows joined at the edges like a real zig-zag drizzle
  let d = "";
  for (let i = 0; i < rows; i++) {
    const y = 80 + (i * 240) / (rows - 1);
    const dx = Math.sqrt(Math.max(0, 128 * 128 - (y - 200) * (y - 200)));
    const x1 = 200 - dx, x2 = 200 + dx, w = x2 - x1, up = i % 2 ? 11 : -11;
    d += i % 2 === 0
      ? `${i === 0 ? "M" : "L"}${x1} ${y} C${x1 + w / 3} ${y + up} ${x1 + (2 * w) / 3} ${y - up} ${x2} ${y} `
      : `L${x2} ${y} C${x1 + (2 * w) / 3} ${y + up} ${x1 + w / 3} ${y - up} ${x1} ${y} `;
  }
  return d;
}

/** Small standalone ingredient (used for floating accents). */
export function IngredientIcon({ kind, size = 48, className }: { kind: ToppingKind | "tomato" | "cheese"; size?: number; className?: string }) {
  return (
    <svg viewBox="-24 -24 48 48" width={size} height={size} className={className} aria-hidden="true">
      {kind === "tomato" ? (
        <g>
          <circle r="19" fill="#d63a22" />
          <circle r="12" fill="#ea6a4e" />
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="0" cy="-6" rx="2.4" ry="5" fill="#f6d8b0" transform={`rotate(${a})`} />
          ))}
        </g>
      ) : kind === "cheese" ? (
        <path d="M-20 12L20 12L20 -2L-4 -16L-20 -2Z" fill="#f4c542" stroke="#c99318" strokeWidth="2" strokeLinejoin="round" />
      ) : (
        <ToppingShape kind={kind} />
      )}
    </svg>
  );
}
