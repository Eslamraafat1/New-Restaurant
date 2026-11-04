import type { Metadata, Viewport } from "next";
import { Cairo, Fraunces, Manrope } from "next/font/google";
import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import "../globals.css";
import { brand } from "@/lib/brand";
import { LocaleProvider } from "@/lib/i18n";
import { defaultDescription, isLocale, locales, ogImage, siteUrl } from "@/lib/site";
import { preHydrationScript } from "@/lib/theme";
import { SiteShell } from "@/components/chrome/SiteShell";

const display = Fraunces({ variable: "--font-display", subsets: ["latin"], weight: ["600", "800", "900"] });
const body = Manrope({ variable: "--font-body", subsets: ["latin"] });
const arabic = Cairo({ variable: "--font-ar", subsets: ["arabic", "latin"], weight: ["400", "600", "800", "900"] });

const defaultTitle = `${brand.name} – Pizza, Crepes & Burgers`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: defaultTitle, template: `%s · ${brand.name}` },
  description: defaultDescription,
  applicationName: brand.name,
  openGraph: {
    type: "website",
    siteName: brand.name,
    locale: "en_US",
    alternateLocale: ["ar_EG"],
    title: defaultTitle,
    description: defaultDescription,
    images: [ogImage],
  },
  twitter: { card: "summary_large_image", title: defaultTitle, description: defaultDescription, images: [ogImage.url] },
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

/** Both languages are prerendered; proxy.ts picks one per request from the `cc-lang` cookie. */
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
