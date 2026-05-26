import type { MetadataRoute } from "next";

export default function manifest(): any {
  return {
    name: "Nexus Flow PostBot",
    short_name: "PostBot",
    description: "Multimodal AI Social Media Command Center",
    start_url: "/",
    display: "standalone",
    background_color: "#0F172A",
    theme_color: "#0F172A",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    widgets: [
      {
        name: "Queue Tracker",
        short_name: "Queue",
        description: "View your upcoming scheduled posts.",
        tag: "queue-widget",
        template_url: "/queue-widget.json",
        type: "application/json",
        collection: [
          {
            name: "upcoming_posts",
            description: "List of posts scheduled for today"
          }
        ]
      }
    ]
  };
}
