import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            // The server doesn't set up CORS middleware, so every /api call goes through this proxy.
            // ws: true also lets GET /api/ws/ (services/socket-service.ts) upgrade to a WebSocket
            // through the same proxy rule — it's a plain HTTP request until that upgrade happens.
            "/api": {
                target: process.env.API_TARGET ?? "http://127.0.0.1:8000",
                changeOrigin: true,
                ws: true,
            },
        },
    },
});
