import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sage Tools | Free Online Calculators, Converters, and Utility Tools",
  description:
    "Use Sage Tools for practical online calculators and utilities including currency conversion, loan planning, discounts, VAT, tips, age calculation, BMI, fuel cost, file size conversion, image resizing, aspect ratio scaling, video and audio size estimation, document length estimation, and resolution inspection.",
  keywords: [
    "online tools",
    "currency converter",
    "loan calculator",
    "discount calculator",
    "percentage calculator",
    "VAT calculator",
    "tip calculator",
    "age calculator",
    "BMI calculator",
    "fuel cost calculator",
    "unit converter",
    "image resizer",
    "aspect ratio tool",
    "video file inspector",
    "audio file inspector",
    "document file inspector",
    "image converter",
    "audio converter",
    "video converter",
    "document converter",
    "resolution inspector",
    "file size converter",
    "SageTech tools",
  ],
  openGraph: {
    title: "Sage Tools | Free Online Calculators and Utility Tools",
    description:
      "Practical everyday tools for money, health, planning, conversions, and media tasks, all in one place.",
    type: "website",
    url: "/tools",
  },
  alternates: {
    canonical: "/tools",
  },
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
