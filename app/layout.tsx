import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Serif } from "next/font/google";
import { JsonLd } from "./components/JsonLd";
import "./globals.css";
import {
  defaultDescription,
  homeTitle,
  organizationJsonLd,
  siteName,
  siteUrl,
  websiteJsonLd,
} from "./lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: homeTitle,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  alternates: {
    canonical: "/",
  },
  appleWebApp: {
    capable: true,
    title: siteName,
  },
  category: "shopping",
  keywords: [
    "affiliate shopping",
    "affiliate shopping market",
    "partner company product recommendations",
    "curated products",
    "trusted product picks",
    "premium shopping",
    "home and kitchen",
    "electronics",
    "gift guide",
  ],
  openGraph: {
    description: defaultDescription,
    images: [
      {
        alt: "Their Markets luxury logo",
        height: 1024,
        url: "/full-logo.jpeg",
        width: 1536,
      },
    ],
    locale: "en_US",
    siteName,
    title: homeTitle,
    type: "website",
    url: siteUrl,
  },
  robots: {
    follow: true,
    googleBot: {
      follow: true,
      index: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
    index: true,
  },
  twitter: {
    card: "summary_large_image",
    description: defaultDescription,
    images: ["/full-logo.jpeg"],
    title: homeTitle,
  },
};

export const viewport: Viewport = {
  themeColor: "#121212",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${notoSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        {children}
      </body>
    </html>
  );
}
