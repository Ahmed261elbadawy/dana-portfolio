import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dana Badawy | Content Strategy & Creation",
    short_name: "Dana Badawy",
    description:
      "Content, brand strategy, social media marketing, for food and lifestyle brands.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F1E6",
    theme_color: "#4A1226",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
