"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import type { Config } from "@/lib/api/types";

/* ───────────────────────── CREPE ───────────────────────── */

export interface CrepeLayers {
  chocolate: "milk" | "dark" | "white" | "none";
  banana: boolean;
  strawberry: boolean;
  nuts: boolean;
  biscuit: boolean;
  extra: boolean;
  savory: { chicken: boolean; cheese: boolean; mushroom: boolean; spinach: boolean };
  isSavory: boolean;
}

export function crepeFromConfig(config: Config, savory: boolean): CrepeLayers {
  const f = config.fruit ?? [];
  const c = config.crunch ?? [];
  const s = config.fillings ?? [];
  return {
    chocolate: savory ? "none" : ((config.chocolate?.[0] as CrepeLayers["chocolate"]) ?? "milk"),
    banana: f.includes("banana"),
    strawberry: f.includes("strawberry"),
    nuts: c.includes("nuts"),
    biscuit: c.includes("biscuit"),
    extra: (config.filling ?? []).includes("extra"),
    isSavory: savory,
    savory: { chicken: s.includes("chicken"), cheese: s.includes("cheese"), mushroom: s.includes("mushroom"), spinach: s.includes("spinach") },
  };
}

export const CREPE_FULL: CrepeLayers = {
  chocolate: "milk", banana: true, strawberry: true, nuts: true, biscuit: false, extra: false, isSavory: false,
  savory: { chicken: false, cheese: false, mushroom: false, spinach: false },
};

const CHOC: Record<string, string> = { milk: "#5a2c16", dark: "#2c130a", white: "#fff4de" };

const BANANA = [[130, 120], [215, 105], [285, 150], [95, 205], [165, 175], [250, 215], [135, 270], [215, 290]];
const STRAW = [[300, 235], [112, 150], [190, 245], [270, 100]];
const NUTS = Array.from({ length: 26 }, (_, i) => { const r = 128 * Math.sqrt((i + 0.5) / 26); const a = i * 2.4; return [200 + r * Math.cos(a), 200 + r * Math.sin(a), (i * 47) % 180]; });
const CRUMBS = Array.from({ length: 22 }, (_, i) => { const r = 135 * Math.sqrt((i + 0.5) / 22); const a = i * 2.9 + 1; return [200 + r * Math.cos(a), 200 + r * Math.sin(a), (i * 31) % 90]; });
const SAV = {
  chicken: Array.from({ length: 10 }, (_, i) => [200 + 95 * Math.cos(i * 1.9), 200 + 95 * Math.sin(i * 1.9) * (0.6 + (i % 3) * 0.2), (i * 40) % 90]),
  mushroom: Array.from({ length: 8 }, (_, i) => [200 + 110 * Math.cos(i * 2.3 + 1), 200 + 90 * Math.sin(i * 2.3 + 1), (i * 33) % 90]),
  spinach: Array.from({ length: 7 }, (_, i) => [200 + 120 * Math.cos(i * 2.7 + 2), 200 + 100 * Math.sin(i * 2.7 + 2), (i * 51) % 180]),
};

function Pop({ id, children, delay = 0, plain }: { id: string; children: ReactNode; delay?: number; plain?: boolean }) {
  if (plain) return <g className="pc" data-l={id}>{children}</g>;
  return (
    <motion.g key={id} initial={{ scale: 0.2, opacity: 0, y: -30 }} animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.2, opacity: 0, transition: { duration: 0.15 } }} transition={{ type: "spring", stiffness: 340, damping: 16, delay }}>
      {children}
    </motion.g>
  );
}

export function CrepeSVG({ layers = CREPE_FULL, className, title, plain }: { layers?: CrepeLayers; className?: string; title?: string; plain?: boolean }) {
  const swirl = "M105 150 Q200 95 295 150 T295 215 T105 245 T290 285";
  const choc = layers.chocolate !== "none";
  return (
    <svg viewBox="0 0 400 400" className={className} role="img" aria-label={title ?? "Crepe"}>
      <defs>
        <radialGradient id="crepe-g" cx="50%" cy="45%" r="60%">
          <stop offset="0" stopColor="#f2cf8e" />
          <stop offset="1" stopColor="#d9a24f" />
        </radialGradient>
      </defs>
      <ellipse cx="204" cy="212" rx="182" ry="176" fill="#000" opacity=".14" />
      <g data-l="crepe">
        <circle cx="200" cy="200" r="178" fill="url(#crepe-g)" />
        {Array.from({ length: 26 }, (_, i) => (
          <circle key={i} cx={200 + 150 * Math.sqrt((i + 0.5) / 26) * Math.cos(i * 2.2)} cy={200 + 150 * Math.sqrt((i + 0.5) / 26) * Math.sin(i * 2.2)} r={5 + (i % 4) * 2} fill="#b8782c" opacity=".35" />
        ))}
      </g>
      <AnimatePresence>
        {choc && plain && (
          <g key="choc-plain" data-l="chocolate">
            <path className="choc" d={swirl} pathLength={1} strokeDasharray={1} strokeDashoffset={0} fill="none" stroke={CHOC[layers.chocolate]} strokeWidth={layers.extra ? 30 : 22} strokeLinecap="round" />
          </g>
        )}
        {choc && !plain && (
          <motion.g key={`choc-${layers.chocolate}`} data-l="chocolate">
            <motion.path d={swirl} fill="none" stroke={CHOC[layers.chocolate]} strokeWidth={layers.extra ? 30 : 22} strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: "easeInOut" }} />
            <motion.path d={swirl} fill="none" stroke="#fff" strokeOpacity=".25" strokeWidth="5" strokeLinecap="round" transform="translate(-3 -5)"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, ease: "easeInOut" }} />
          </motion.g>
        )}
        {layers.isSavory && layers.extra && (
          <motion.circle key="sav-extra" cx="200" cy="200" r="120" fill="#f6dd96" opacity=".6" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} />
        )}
        {layers.isSavory && layers.savory.cheese && (
          <Pop key="sv-cheese" plain={plain} id="sv-cheese"><g data-l="cheese">{Array.from({ length: 14 }, (_, i) => <rect key={i} x={200 + 120 * Math.cos(i * 1.7) - 14} y={200 + 100 * Math.sin(i * 1.7) - 3} width="28" height="6" rx="3" fill="#f7d466" transform={`rotate(${i * 38} ${200 + 120 * Math.cos(i * 1.7)} ${200 + 100 * Math.sin(i * 1.7)})`} />)}</g></Pop>
        )}
        {layers.isSavory && layers.savory.chicken && (
          <Pop key="sv-chicken" plain={plain} id="sv-chicken"><g data-l="chicken">{SAV.chicken.map(([x, y, r], i) => <rect key={i} x={x - 14} y={y - 10} width="28" height="20" rx="8" fill="#e7c18a" stroke="#b98a4e" strokeWidth="2" transform={`rotate(${r} ${x} ${y})`} />)}</g></Pop>
        )}
        {layers.isSavory && layers.savory.mushroom && (
          <Pop key="sv-mush" plain={plain} id="sv-mush"><g data-l="mushroom">{SAV.mushroom.map(([x, y, r], i) => <path key={i} d="M-14 4C-14-12 14-12 14 4L5 4L5 12L-5 12L-5 4Z" fill="#dfcba8" stroke="#8d7550" strokeWidth="2" transform={`translate(${x} ${y}) rotate(${r})`} />)}</g></Pop>
        )}
        {layers.isSavory && layers.savory.spinach && (
          <Pop key="sv-spin" plain={plain} id="sv-spin"><g data-l="spinach">{SAV.spinach.map(([x, y, r], i) => <path key={i} d="M0-15C12-8 12 8 0 15C-12 8-12-8 0-15Z" fill="#3d8a2b" transform={`translate(${x} ${y}) rotate(${r})`} />)}</g></Pop>
        )}
        {layers.banana && (
          <Pop key="banana" plain={plain} id="banana"><g data-l="banana">{BANANA.map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`}><circle r="22" fill="#f6e08a" stroke="#d8b94c" strokeWidth="3" /><circle r="6" fill="#c9a23a" opacity=".55" /></g>
          ))}</g></Pop>
        )}
        {layers.strawberry && (
          <Pop key="straw" plain={plain} id="straw" delay={0.08}><g data-l="strawberry">{STRAW.map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${i * 30})`}>
              <path d="M0 24C-26 6-24-18 0-18C24-18 26 6 0 24Z" fill="#d6223a" />
              <path d="M-9-18L0-28L9-18Z" fill="#3f8a2b" />
              {[[-8, -4], [6, -6], [0, 6], [-4, 12], [8, 4]].map(([a, b], j) => <ellipse key={j} cx={a} cy={b} rx="1.6" ry="2.4" fill="#f9d98a" />)}
            </g>
          ))}</g></Pop>
        )}
        {layers.nuts && (
          <Pop key="nuts" plain={plain} id="nuts" delay={0.12}><g data-l="nuts">{NUTS.map(([x, y, r], i) => <path key={i} d="M-7-3L-2-8L7-5L8 3L1 8L-7 5Z" fill="#a9703a" stroke="#7b4a1e" strokeWidth="1.5" transform={`translate(${x} ${y}) rotate(${r})`} />)}</g></Pop>
        )}
        {layers.biscuit && (
          <Pop key="biscuit" plain={plain} id="biscuit" delay={0.16}><g data-l="biscuit">{CRUMBS.map(([x, y, r], i) => <rect key={i} x={x - 5} y={y - 4} width="10" height="8" rx="2" fill="#d2a368" transform={`rotate(${r} ${x} ${y})`} />)}</g></Pop>
        )}
      </AnimatePresence>
    </svg>
  );
}

/** Folded crepe on a plate – the finished state of the crepe scene. */
export function CrepeFoldedSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} role="img" aria-label="Folded crepe">
      <ellipse cx="200" cy="300" rx="180" ry="46" fill="#000" opacity=".16" />
      <ellipse cx="200" cy="270" rx="176" ry="48" fill="#fffaf0" stroke="#e3d3b4" strokeWidth="4" />
      <path d="M200 285L78 150Q200 40 322 150Z" fill="#e8b45e" stroke="#c88a36" strokeWidth="4" strokeLinejoin="round" />
      <path d="M200 285L142 100M200 285L258 100" stroke="#c88a36" strokeWidth="3" opacity=".5" fill="none" />
      <path d="M110 150Q200 80 290 150" fill="none" stroke="#5a2c16" strokeWidth="14" strokeLinecap="round" />
      <path d="M130 185Q200 120 275 190" fill="none" stroke="#5a2c16" strokeWidth="12" strokeLinecap="round" opacity=".9" />
      {[[150, 140], [200, 120], [250, 142]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}><circle r="16" fill="#f6e08a" stroke="#d8b94c" strokeWidth="3" /></g>
      ))}
      {[[300, 250], [100, 252]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}><path d="M0 22C-24 6-22-16 0-16C22-16 24 6 0 22Z" fill="#d6223a" /><path d="M-8-16L0-26L8-16Z" fill="#3f8a2b" /></g>
      ))}
      {NUTS.slice(0, 14).map(([, , r], i) => <path key={i} d="M-6-3L-2-7L6-4L7 3L1 7L-6 4Z" fill="#a9703a" transform={`translate(${130 + (i * 11) % 150} ${190 + ((i * 17) % 60)}) rotate(${r})`} />)}
    </svg>
  );
}

/* ───────────────────────── BURGER ───────────────────────── */

export interface BurgerLayers { double: boolean; cheese: boolean; lettuce: boolean; tomato: boolean; bacon: boolean }
export const BURGER_FULL: BurgerLayers = { double: false, cheese: true, lettuce: true, tomato: true, bacon: false };
export function burgerFromConfig(config: Config): BurgerLayers {
  const e = config.extras ?? [];
  return { double: config.patty?.[0] === "double", cheese: config.cheese?.[0] === "cheddar", lettuce: e.includes("lettuce"), tomato: e.includes("tomato"), bacon: e.includes("bacon") };
}

export function BurgerSVG({ layers = BURGER_FULL, className, title, plain }: { layers?: BurgerLayers; className?: string; title?: string; plain?: boolean }) {
  // stack from bottom (y grows downward). Each layer is a fixed-height slot.
  const slots: { key: string; h: number; node: ReactNode }[] = [];
  slots.push({ key: "bun-b", h: 38, node: (<g data-l="bun-bottom"><path d="M70 0H330V16Q330 38 300 38H100Q70 38 70 16Z" fill="#e0a04a" stroke="#b97725" strokeWidth="3" /></g>) });
  const patty = (k: string) => ({ key: k, h: 34, node: (<g data-l={k}><rect x="62" y="0" width="276" height="34" rx="17" fill="#5b2d1a" stroke="#3a1a0d" strokeWidth="3" />{[110, 160, 215, 265].map((x) => <circle key={x} cx={x} cy="14" r="3" fill="#7d4529" />)}</g>) });
  slots.push(patty("patty"));
  if (layers.bacon) slots.push({ key: "bacon", h: 14, node: (<g data-l="bacon"><path d="M66 6Q110 -6 150 6T230 6T334 6" fill="none" stroke="#a8322a" strokeWidth="12" strokeLinecap="round" /></g>) });
  if (layers.cheese) slots.push({ key: "cheese", h: 22, node: (<g data-l="cheese"><path d="M60 0H340L316 12L300 30L276 12L230 22L206 8L160 26L130 10L100 22L84 10Z" fill="#f4b92a" stroke="#c98c0c" strokeWidth="3" strokeLinejoin="round" /></g>) });
  if (layers.double) { slots.push(patty("patty2")); if (layers.cheese) slots.push({ key: "cheese2", h: 22, node: (<g data-l="cheese2"><path d="M60 0H340L316 12L300 30L276 12L230 22L206 8L160 26L130 10L100 22L84 10Z" fill="#f4b92a" stroke="#c98c0c" strokeWidth="3" strokeLinejoin="round" /></g>) }); }
  if (layers.lettuce) slots.push({ key: "lettuce", h: 22, node: (<g data-l="lettuce"><path d="M54 10Q74-6 96 8T140 8T184 8T228 8T272 8T316 8T346 10Q346 24 330 22T290 24T240 22T190 24T140 22T90 24T58 22Z" fill="#6bb43a" stroke="#3d7c1f" strokeWidth="3" /></g>) });
  if (layers.tomato) slots.push({ key: "tomato", h: 22, node: (<g data-l="tomato"><rect x="78" y="0" width="244" height="22" rx="11" fill="#dc3b24" stroke="#a02512" strokeWidth="3" />{[130, 200, 270].map((x) => <circle key={x} cx={x} cy="11" r="3" fill="#f5a08e" />)}</g>) });
  slots.push({ key: "sauce", h: 14, node: (<g data-l="sauce"><path d="M80 6Q110-4 140 6T200 6T260 6T320 6" fill="none" stroke="#e8672a" strokeWidth="11" strokeLinecap="round" /></g>) });
  slots.push({ key: "bun-t", h: 92, node: (<g data-l="bun-top"><path d="M62 92Q62 6 200 6Q338 6 338 92Z" fill="#e8a851" stroke="#b97725" strokeWidth="3" />{[[120, 52], [170, 32], [230, 36], [280, 56], [200, 62], [148, 70], [255, 76]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="7" ry="3.6" fill="#fff0c8" transform={`rotate(${i * 30} ${x} ${y})`} />)}</g>) });

  const base = 330;
  let y = base;
  const placed = slots.map((s) => { y -= s.h; return { ...s, y }; });
  return (
    <svg viewBox="0 0 400 380" className={className} role="img" aria-label={title ?? "Burger"}>
      <ellipse cx="200" cy="344" rx="170" ry="20" fill="#000" opacity=".18" />
      {placed.map((s) => (
        <g key={s.key} transform={`translate(0 ${s.y})`} data-slot={s.key}>
          {plain ? (
            <g className="bl">{s.node}</g>
          ) : (
            <motion.g key={s.key} initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 14 }}>{s.node}</motion.g>
          )}
        </g>
      ))}
    </svg>
  );
}

/* ───────────────────────── OTHER DISHES ───────────────────────── */

export type DishKind = "pasta" | "appetizer" | "dessert" | "drink" | "combo";

export function DishSVG({ kind, className, title }: { kind: DishKind; className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} role="img" aria-label={title ?? kind}>
      {kind === "pasta" && (
        <g>
          <ellipse cx="204" cy="262" rx="176" ry="60" fill="#000" opacity=".15" />
          <ellipse cx="200" cy="240" rx="176" ry="68" fill="#fffaf0" stroke="#e3d3b4" strokeWidth="4" />
          <ellipse cx="200" cy="226" rx="120" ry="44" fill="#e8b24c" />
          {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${100 + i * 8} ${230 - i * 4}Q200 ${150 - i * 4} ${300 - i * 8} ${230 - i * 4}`} fill="none" stroke="#f2d27a" strokeWidth="9" strokeLinecap="round" />)}
          <ellipse cx="200" cy="170" rx="70" ry="34" fill="#c93a20" />
          {[160, 200, 238].map((x) => <circle key={x} cx={x} cy="166" r="9" fill="#3f8a2b" />)}
        </g>
      )}
      {kind === "appetizer" && (
        <g>
          <ellipse cx="204" cy="300" rx="176" ry="46" fill="#000" opacity=".15" />
          <ellipse cx="200" cy="280" rx="176" ry="50" fill="#fffaf0" stroke="#e3d3b4" strokeWidth="4" />
          {[[130, 230], [200, 200], [270, 230], [165, 160], [240, 160]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${i * 25})`}><ellipse rx="40" ry="26" fill="#e0a04a" stroke="#b97725" strokeWidth="3" /><path d="M-26 -4Q0 -14 26 -4" stroke="#fff0c8" strokeWidth="4" fill="none" strokeLinecap="round" opacity=".6" /><circle cx="-8" cy="2" r="2.5" fill="#3f8a2b" /><circle cx="10" cy="-3" r="2.5" fill="#3f8a2b" /></g>
          ))}
          <ellipse cx="316" cy="260" rx="34" ry="14" fill="#c93a20" />
        </g>
      )}
      {kind === "dessert" && (
        <g>
          <ellipse cx="204" cy="320" rx="170" ry="40" fill="#000" opacity=".15" />
          <ellipse cx="200" cy="300" rx="170" ry="44" fill="#fffaf0" stroke="#e3d3b4" strokeWidth="4" />
          <path d="M110 290V190Q110 120 200 120T290 190V290Z" fill="#5a2c16" stroke="#3a1a0d" strokeWidth="4" />
          <path d="M150 150Q200 120 250 150Q230 190 200 170Q170 190 150 150Z" fill="#8a4a24" opacity=".75" />
          <path d="M180 250Q200 300 220 250Q240 330 180 310Z" fill="#3a1a0d" />
          <circle cx="258" cy="226" r="20" fill="#d6223a" /><path d="M250 208L258 196L266 208Z" fill="#3f8a2b" />
        </g>
      )}
      {kind === "drink" && (
        <g>
          <ellipse cx="200" cy="360" rx="100" ry="16" fill="#000" opacity=".15" />
          <path d="M120 100H280L262 346Q260 360 244 360H156Q140 360 138 346Z" fill="#fff" fillOpacity=".35" stroke="#1f9bb0" strokeWidth="5" strokeLinejoin="round" />
          <path d="M127 160H273L262 346Q260 360 244 360H156Q140 360 138 346Z" fill="#f2b84a" fillOpacity=".85" />
          {[[170, 210], [215, 250], [190, 300], [235, 190]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="9" fill="#fff" fillOpacity=".55" />)}
          {[[160, 190], [230, 230], [200, 150]].map(([x, y], i) => <rect key={i} x={x - 16} y={y - 16} width="32" height="32" rx="6" fill="#fff" fillOpacity=".6" transform={`rotate(${i * 20} ${x} ${y})`} />)}
          <path d="M240 40L222 260" stroke="#d63a22" strokeWidth="12" strokeLinecap="round" />
          <path d="M180 120Q200 80 230 100Q206 130 180 120Z" fill="#3f8a2b" />
        </g>
      )}
      {kind === "combo" && (
        <g>
          <ellipse cx="204" cy="340" rx="170" ry="30" fill="#000" opacity=".15" />
          <circle cx="170" cy="210" r="120" fill="#e6ac52" /><circle cx="170" cy="210" r="102" fill="#c93a20" /><circle cx="170" cy="210" r="94" fill="#f6e0a0" />
          {[[130, 180], [200, 170], [160, 250], [220, 240]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="17" fill="#c3321f" />)}
          <path d="M290 150H350L342 330H298Z" fill="#fff" fillOpacity=".45" stroke="#1f9bb0" strokeWidth="5" strokeLinejoin="round" />
          <path d="M294 200H346L342 330H298Z" fill="#f2b84a" fillOpacity=".85" />
        </g>
      )}
    </svg>
  );
}
