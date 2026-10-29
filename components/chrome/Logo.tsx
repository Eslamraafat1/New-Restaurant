import Link from "next/link";
import { brand } from "@/lib/brand";

export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="var(--tomato)" />
      <path d="M24 24L24 4A20 20 0 0 1 43.4 19Z" fill="var(--cheese)" />
      <circle cx="31" cy="14" r="3.2" fill="var(--tomato-deep)" />
      <circle cx="35" cy="21" r="2.4" fill="var(--tomato-deep)" />
      <path d="M13 33c4-8 12-9 20-3" stroke="var(--cheese)" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="16" cy="30" r="2.6" fill="var(--basil)" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 ${className}`} aria-label={brand.name}>
      <LogoMark />
      <span className="display whitespace-nowrap text-[1.05rem] tracking-tight max-[359px]:text-[0.72rem] sm:text-xl" style={{ lineHeight: 1 }}>
        CRUST<span className="text-tomatotext"> &amp; </span>CRAVE
      </span>
    </Link>
  );
}
