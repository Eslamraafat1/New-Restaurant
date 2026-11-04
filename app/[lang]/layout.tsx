import type { Metadata, Viewport } from "next";
import { Cairo, Fraunces, Manrope } from "next/font/google";
import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import "../globals.css";
import { brand } from "@/lib/brand";
import { LocaleProvider } from "@/lib/i18n";
import { ogLocale, otherLocale } from "@/lib/i18n/paths";
import { defaultDescriptions, isLocale, locales, ogImage, pageLocale, siteUrl } from "@/lib/site";
import { preHydrationScript } from "@/lib/theme";
import { SiteShell } from "@/components/chrome/SiteShell";

const display = Fraunces({ variable: "--font-display", subsets: ["latin"], weight: ["600", "800", "900"] });
const body = Manrope({ variable: "--font-body", subsets: ["latin"] });
const arabic = Cairo({ variable: "--font-ar", subsets: ["arabic", "latin"], weight: ["400", "600", "800", "900"] });

const defaultTitles = {
  en: `${brand.name} – Pizza, Crepes & Burgers`,
  ar: `${brand.name} – بيتزا وكريب وبرجر`,
};

/** Site-wide defaults per language; pages override title, description, canonical and hreflang. */
export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const l = await pageLocale(params);
  return {
    metadataBase: new URL(siteUrl),
    title: { default: defaultTitles[l], template: `%s · ${brand.name}` },
    description: defaultDescriptions[l],
    applicationName: brand.name,
    openGraph: {
      type: "website",
      siteName: brand.name,
      locale: ogLocale[l],
      alternateLocale: [ogLocale[otherLocale(l)]],
      title: defaultTitles[l],
      description: defaultDescriptions[l],
      images: [ogImage],
    },
    twitter: { card: "summary_large_image", title: defaultTitles[l], description: defaultDescriptions[l], images: [ogImage.url] },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf4e4" },
    { media: "(prefers-color-scheme: dark)", color: "#14100e" },
  ],
};

/** Both languages are prerendered: English is served at the root (rewritten by proxy.ts), Arabic under /ar. */
export async function generateStaticParams() {
  return locales.map((l) => ({ lang: l }));
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await lang();
  if (!isLocale(locale)) notFound();
  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${arabic.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: preHydrationScript }} />
      </head>
      <body className="min-h-dvh">
        <LocaleProvider locale={locale}>
          <SiteShell>{children}</SiteShell>
        </LocaleProvider>
      </body>
    </html>
  );
}
