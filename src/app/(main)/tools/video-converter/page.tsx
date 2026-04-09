import type { Metadata } from "next";

import VideoConverterClient from "./VideoConverterClient";

export const metadata: Metadata = {
  title: "Video Converter | Convert MP4, WebM, MOV, AVI and MKV Online",
  description:
    "Convert real video files between MP4, WebM, MOV, AVI, and MKV with SageTech Video Converter.",
  alternates: {
    canonical: "/tools/video-converter",
  },
  openGraph: {
    title: "Video Converter | Convert MP4, WebM, MOV, AVI and MKV Online",
    description:
      "Convert real video files between MP4, WebM, MOV, AVI, and MKV.",
    type: "website",
    url: "/tools/video-converter",
  },
};

export default function VideoConverterPage() {
  return <VideoConverterClient />;
}
