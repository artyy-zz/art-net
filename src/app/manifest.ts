import type { MetadataRoute } from "next";
import { siteName } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteName,
    short_name: "Artnet",
    description:
      "Premium networks, security systems, smart devices, and technology infrastructure by Artnet.",
    start_url: "/sq",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#006b96",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/icon.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
