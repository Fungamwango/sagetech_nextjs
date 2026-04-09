import type { Metadata } from "next";

import AudioConverterClient from "./AudioConverterClient";

export const metadata: Metadata = {
  title: "Audio Converter | Convert MP3, WAV, AAC, FLAC, OGG and More",
  description:
    "Convert real audio files between WAV, MP3, AAC, FLAC, OGG, and M4A with SageTech Audio Converter.",
  alternates: {
    canonical: "/tools/audio-converter",
  },
  openGraph: {
    title: "Audio Converter | Convert MP3, WAV, AAC, FLAC, OGG and More",
    description:
      "Convert real audio files between WAV, MP3, AAC, FLAC, OGG, and M4A.",
    type: "website",
    url: "/tools/audio-converter",
  },
};

export default function AudioConverterPage() {
  return <AudioConverterClient />;
}
