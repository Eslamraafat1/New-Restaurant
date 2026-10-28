"use client";

/**
 * Splits text for GSAP without hurting accessibility: the real text stays in a visually hidden span,
 * the animated pieces are aria-hidden. Latin text is split into letters (kept together per word so lines
 * never break mid-word); Arabic is split by WORD because splitting letters would break the joined script.
 */
export function Chars({ text, className = "" }: { text: string; className?: string }) {
  const arabic = /[؀-ۿ]/.test(text);
  const words = text.split(" ").filter(Boolean);
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, wi) => (
          <span key={wi} className="inline-block whitespace-nowrap">
            {arabic ? (
              <span data-char className="inline-block will-change-transform">{w}</span>
            ) : (
              Array.from(w).map((c, ci) => <span key={ci} data-char className="inline-block will-change-transform">{c}</span>)
            )}
            {wi < words.length - 1 && <span className="inline-block w-[0.26em]" />}
          </span>
        ))}
      </span>
    </span>
  );
}
