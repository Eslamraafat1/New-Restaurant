import { ImageResponse } from "next/og";
import { brand } from "@/lib/brand";

export const alt = `${brand.name} – Pizza, Crepes & Burgers (demo storefront)`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Branded share card, generated at build time. Colours match the light theme tokens in globals.css. */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#fbf0da",
          color: "#1c120d",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 999,
              background: "#e5381b",
              color: "#fbf0da",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 800,
            }}
          >
            {brand.mark}
          </div>
          <div style={{ fontSize: 28, letterSpacing: 6, color: "#5c4a40" }}>DEMO STOREFRONT</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 132, fontWeight: 900, lineHeight: 1, color: "#c92a12" }}>{brand.name}</div>
          <div style={{ fontSize: 44, marginTop: 28 }}>{brand.tagline.en}</div>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 30, color: "#5c4a40" }}>
          {["Pizza", "Crepes", "Burgers", "EN / AR"].map((x) => (
            <div key={x} style={{ display: "flex", padding: "10px 26px", border: "3px solid #1c120d", borderRadius: 999 }}>{x}</div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
