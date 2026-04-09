import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastProvider";
import NavigationLoader from "@/components/ui/NavigationLoader";
import PwaInstall from "@/components/ui/PwaInstall";
import GuestVisitorTracker from "@/components/ui/GuestVisitorTracker";

const CLOUDFLARE_ANALYTICS_TOKEN = "c6cc81f44741494a841ff3a262bdf174";
const RESPONSIVE_VOICE_SRC = "https://code.responsivevoice.org/responsivevoice.js?key=GmwfwYBw";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://sageteche.com"),
  title: "SageTech | Make money, find friends, post & download songs, videos, apps, books, sell products, earn points",
  description: "Connect with friends, Make money, Chat, Upload and download songs, free apps, free books, free videos, sell products, earn points and more on SageTech",
  manifest: "/manifest.webmanifest",
  keywords: "SageTech, download, songs, videos, apps, books, social, earn points, sell products",
  openGraph: {
    siteName: "SageTech",
    type: "website",
    title: "SageTech | Make money, Chat, find friends, download songs, videos, apps, books, sell products",
    description: "Connect with friends, Make money, Chat, Upload and download songs, apps, books, videos, sell products, earn points and more on SageTech",
    images: [{ url: "/files/sagetech_icon.jpg" }],
    url: "https://sageteche.com",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
        <meta name="google-adsense-account" content="ca-pub-5946856530564373" />
        <link rel="icon" href="/files/sagetech_icon.jpg" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <Script
          id="cloudflare-web-analytics"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          strategy="afterInteractive"
          data-cf-beacon={JSON.stringify({ token: CLOUDFLARE_ANALYTICS_TOKEN })}
        />
        <Script
          id="responsive-voice"
          src={RESPONSIVE_VOICE_SRC}
          strategy="afterInteractive"
        />
      </head>
      <body suppressHydrationWarning>
        <ToastProvider>{children}</ToastProvider>
        <PwaInstall />
        <GuestVisitorTracker />
        <Suspense fallback={null}>
          <NavigationLoader />
        </Suspense>
      </body>
    </html>
  );
}
