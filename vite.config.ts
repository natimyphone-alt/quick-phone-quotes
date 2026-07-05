import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    preview: {
      allowedHosts: ["quick-phone-quotes.onrender.com"],
    },
    server: {
      allowedHosts: ["quick-phone-quotes.onrender.com"],
    },
  },
});