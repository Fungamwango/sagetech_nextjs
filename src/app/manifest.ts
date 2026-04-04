import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SageTech",
    short_name: "SageTech",
    description:
      "Connect with friends, chat, post, upload and download songs, videos, apps, documents, sell products, earn points and more on SageTech.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f1f28",
    theme_color: "#023",
    id: "/",
    icons: [
      {
        src: "/pwa/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
