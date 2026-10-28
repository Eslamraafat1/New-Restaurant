import Image from "next/image";

/** Fills its (relatively positioned) parent. Always give the parent a size / aspect ratio. */
export function Photo({ src, alt = "", sizes = "(max-width: 768px) 90vw, 40vw", className = "", priority = false, quality = 75 }: {
  src: string; alt?: string; sizes?: string; className?: string; priority?: boolean; quality?: number;
}) {
  return <Image src={src} alt={alt} fill sizes={sizes} quality={quality} priority={priority} className={`object-cover ${className}`} />;
}
