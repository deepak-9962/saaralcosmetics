import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Saaral Cosmetics — Natural Herbal Skincare",
    short_name: "Saaral",
    description: "Handcrafted 100% natural herbal skincare products in India.",
    start_url: "/",
    display: "standalone",
    background_color: "#FDF6F0",
    theme_color: "#5A2E3B",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
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
