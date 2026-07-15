import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import InstallPrompt from "@/components/InstallPrompt";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
});

const notoSerifKR = Noto_Serif_KR({
  variable: "--font-noto-serif-kr",
  weight: ["700"],
  subsets: ["latin"],
});

const SITE_NAME = "카페인노트";
const SITE_DESCRIPTION =
  "카페 음료의 카페인·칼로리·당류를 검색하고, 취침 시간 기준 잔존 카페인을 계산해보세요.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  // Every page currently sets its own full title string (e.g. "소개 | 카페인노트"),
  // so this stays a plain default rather than a template to avoid a double
  // "| 카페인노트 | 카페인노트" suffix on those pages.
  title: `${SITE_NAME} | CaffeineNote`,
  description: SITE_DESCRIPTION,
  icons: {
    icon: [
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "카페인노트",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | CaffeineNote`,
    description: SITE_DESCRIPTION,
    locale: "ko_KR",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | CaffeineNote`,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  alternates: {
    types: { "application/rss+xml": "/rss.xml" },
  },
  // Naver Search Advisor site-verification meta tag — leave
  // NAVER_SITE_VERIFICATION unset until you have a real code from
  // https://searchadvisor.naver.com; the tag simply won't render until then.
  ...(process.env.NAVER_SITE_VERIFICATION && {
    verification: { other: { "naver-site-verification": process.env.NAVER_SITE_VERIFICATION } },
  }),
  other: {
    // Next's `appleWebApp.capable` now emits the modern, non-prefixed
    // `mobile-web-app-capable` tag; older iOS Safari only honors the
    // apple-prefixed one, so set it explicitly for compatibility.
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#3d6b52",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  // Only load GA4 in production, and only when a measurement ID is actually
  // configured — keeps dev/preview traffic out of analytics and avoids
  // shipping a script tag that has nothing to point at.
  const gaEnabled = process.env.NODE_ENV === "production" && Boolean(gaId);

  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const adsenseEnabled = process.env.NODE_ENV === "production" && Boolean(adsenseClientId);

  return (
    <html
      lang="ko"
      className={`${notoSansKR.variable} ${notoSerifKR.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {/*
          App Router doesn't support a hand-written <head> element in the
          layout, so next/script is the framework-idiomatic stand-in for
          AdSense's "paste in <head>" instruction — Next hoists it there
          regardless of where it's written in the tree.
        */}
        {adsenseEnabled && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
        {children}
        <ServiceWorkerRegister />
        <InstallPrompt />
        {gaEnabled && <GoogleAnalytics gaId={gaId!} />}
      </body>
    </html>
  );
}
