import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"],
      manifest: {
        name: "הטיול שלנו ליפן",
        short_name: "טיול יפן",
        description: "לוז, תקציב ומזג אוויר לטיול ביפן וקוריאה",
        start_url: "/",
        display: "standalone",
        background_color: "#F7F1E4",
        theme_color: "#1F3A5F",
        lang: "he",
        dir: "rtl",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        // Precache the app shell + the synced Excel data, so the itinerary opens offline
        globPatterns: ["**/*.{js,css,html,ico,png,svg,xlsx}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.open-meteo\.com\//,
            handler: "NetworkFirst",
            options: { cacheName: "weather-cache", expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 12 }, networkTimeoutSeconds: 6 },
          },
          {
            urlPattern: /^https:\/\/api\.frankfurter\.app\//,
            handler: "NetworkFirst",
            options: { cacheName: "fx-cache", expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 }, networkTimeoutSeconds: 6 },
          },
        ],
      },
    }),
  ],
});
