import type { Metadata, Viewport } from "next";
import { Cairo, Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { brand } from "@/lib/brand";
import { preHydrationScript } from "@/lib/theme";
import { SiteShell } from "@/components/chrome/SiteShell";

const display = Fraunces({ variable: "--font-display", subsets: ["latin"], weight: ["600", "800", "900"] });
const body = Manrope({ variable: "--font-body", subsets: ["latin"] });
const arabic = Cairo({ variable: "--font-ar", subsets: ["arabic", "latin"], weight: ["400", "600", "800", "900"] });

export const metadata: Metadata = {
  title: { default: `${brand.name} – Pizza, Crepes & Burgers`, template: `%s · ${brand.name}` },
  description: `${brand.tagline.en} A fictional demo storefront with a customisable menu and demo checkout.`,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf4e4" },
    { media: "(prefers-color-scheme: dark)", color: "#14100e" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${arabic.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: preHydrationScript }} />
      </head>
      <body className="min-h-dvh">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
