import type { Metadata } from "next";

import ImageConverterClient from "./ImageConverterClient";

export const metadata: Metadata = {
  title: "Image Converter | Convert JPG, PNG, WebP, AVIF, TIFF and More",
  description:
    "Convert real image files between JPG, PNG, WebP, AVIF, BMP, TIFF, ICO, and SVG with SageTech Image Converter.",
  alternates: {
    canonical: "/tools/image-converter",
  },
  openGraph: {
    title: "Image Converter | Convert JPG, PNG, WebP, AVIF, TIFF and More",
    description:
      "Convert real image files between JPG, PNG, WebP, AVIF, BMP, TIFF, ICO, and SVG.",
    type: "website",
    url: "/tools/image-converter",
  },
};

export default function ImageConverterPage() {
  return <ImageConverterClient />;
}
