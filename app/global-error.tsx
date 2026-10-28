"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", background: "#fbf4e4", color: "#231815" }}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 40 }}>Something went wrong · حدث خطأ ما</h1>
          <button onClick={reset} style={{ marginTop: 16, padding: "12px 24px", borderRadius: 999, border: 0, background: "#d63a22", color: "#fff", fontWeight: 800 }}>Try again · حاول مرة أخرى</button>
        </div>
      </body>
    </html>
  );
}
