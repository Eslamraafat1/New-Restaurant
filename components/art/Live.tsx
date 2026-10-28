"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Config, Product } from "@/lib/api/types";

/** Crossfading real photograph. */
function Swap({ src, alt }: { src: string; alt: string }) {
  return (
    <AnimatePresence initial={false}>
      <motion.img key={src} src={src} alt={alt} initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }} className="absolute inset-0 h-full w-full object-cover" />
    </AnimatePresence>
  );
}

const pop = {
  initial: { scale: 0, opacity: 0, y: -40, rotate: -40 },
  animate: { scale: 1, opacity: 1, y: 0, rotate: 0 },
  exit: { scale: 0, opacity: 0, transition: { duration: 0.15 } },
};

function Piece({ src, x, y, size, rot = 0, delay = 0 }: { src: string; x: number; y: number; size: number; rot?: number; delay?: number }) {
  return (
    <motion.span {...pop} transition={{ type: "spring", stiffness: 320, damping: 15, delay }} className="pointer-events-none absolute"
      style={{ left: `${x}%`, top: `${y}%`, width: `${size}%`, aspectRatio: "1", marginLeft: `${-size / 2}%`, marginTop: `${-size / 2}%` }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="h-full w-full object-contain" style={{ transform: `rotate(${rot}deg)`, filter: "drop-shadow(0 6px 6px rgba(30,10,0,.45))" }} />
    </motion.span>
  );
}

const BANANAS = [[24, 30, 15, 10], [72, 22, 14, -20], [30, 74, 15, 30], [78, 70, 16, 5], [50, 50, 14, 15]];
const BERRIES = [["straw1", 22, 28, 18], ["rasp1", 74, 26, 11], ["straw2", 78, 74, 16], ["rasp2", 26, 76, 11], ["rasp3", 52, 14, 10]] as const;
const CREAM = [["cream1", 28, 52, 20], ["cream2", 68, 50, 20]] as const;

export function CrepeLive({ product, config }: { product: Product; config: Config }) {
  const savory = !product.options.some((g) => g.id === "chocolate");
  const f = config.fruit ?? [];
  const banana = f.includes("banana"), straw = f.includes("strawberry");
  const base = savory ? product.image : straw && !banana ? "/img/crepe-berry.jpg" : banana && !straw ? "/img/crepe-banana.jpg" : straw && banana ? product.image : "/img/crepe-plain.jpg";
  const choc = config.chocolate?.[0];
  // only draw a sauce overlay when the choice differs from the photo's own (default) chocolate
  const sauce = choc && choc !== product.defaults.chocolate?.[0] ? (choc === "dark" ? "#2a1208" : choc === "white" ? "#fff2d8" : choc === "milk" ? "#5a2c16" : null) : null;
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
      <Swap src={base} alt={product.name.en} />
      <AnimatePresence>
        {sauce && (
          <motion.svg key={sauce} viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-hidden>
            <motion.path d="M8 60 Q28 40 46 58 T84 52 T96 66" fill="none" stroke={sauce} strokeWidth="1.8" strokeLinecap="round" style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,.5))" }}
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9 }} />
            <motion.path d="M10 62 Q30 44 47 60 T83 55" fill="none" stroke="#fff" strokeOpacity=".28" strokeWidth=".8" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9 }} />
          </motion.svg>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {banana && BANANAS.map(([x, y, s, r], i) => <Piece key={`b${i}`} src={`/img/cut/banana${(i % 3) + 1}.png`} x={x} y={y} size={s} rot={r} delay={i * 0.04} />)}
        {straw && BERRIES.map(([n, x, y, s], i) => <Piece key={`s${i}`} src={`/img/cut/${n}.png`} x={x} y={y} size={s} delay={i * 0.04} />)}
        {choc === "white" && CREAM.map(([n, x, y, s]) => <Piece key={n} src={`/img/cut/${n}.png`} x={x} y={y} size={s} />)}
        {(config.crunch ?? []).includes("nuts") && Array.from({ length: 14 }, (_, i) => (
          <motion.span key={`n${i}`} {...pop} transition={{ delay: i * 0.02, type: "spring", stiffness: 300, damping: 14 }} className="pointer-events-none absolute h-[3.2%] w-[3.2%] rounded-[40%_60%_50%_50%]"
            style={{ left: `${20 + ((i * 37) % 60)}%`, top: `${25 + ((i * 53) % 50)}%`, background: "linear-gradient(135deg,#c98a4b,#7b4a1e)" }} />
        ))}
        {(config.crunch ?? []).includes("biscuit") && Array.from({ length: 14 }, (_, i) => (
          <motion.span key={`k${i}`} {...pop} transition={{ delay: i * 0.02 }} className="pointer-events-none absolute h-[2.6%] w-[2.6%] rounded-sm"
            style={{ left: `${18 + ((i * 29) % 64)}%`, top: `${22 + ((i * 41) % 56)}%`, background: "#d8aa6b", rotate: `${i * 31}deg` }} />
        ))}
      </AnimatePresence>
    </div>
  );
}

export function BurgerLive({ product, config }: { product: Product; config: Config }) {
  const src = config.patty?.[0] === "double" && product.image !== "/img/burger-double.jpg" ? "/img/burger-double.jpg" : product.image;
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
      <Swap src={src} alt={product.name.en} />
    </div>
  );
}
