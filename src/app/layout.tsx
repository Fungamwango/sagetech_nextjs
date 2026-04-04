import { Suspense } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastProvider";
import NavigationLoader from "@/components/ui/NavigationLoader";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://sageteche.com"),
  title: "SageTech | Make money, find friends, post & download songs, videos, apps, books, sell products, earn points",
  description: "Connect with friends, Make money, Chat, Upload and download songs, free apps, free books, free videos, sell products, earn points and more on SageTech",
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
        <link rel="icon" href="/files/sagetech_icon.jpg" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body suppressHydrationWarning>
        <ToastProvider>{children}</ToastProvider>
        <Suspense fallback={null}>
          <NavigationLoader />
        </Suspense>
      </body>
    </html>
  );
}
