import { defineConfig } from 'vite';
import compression from 'vite-plugin-compression2';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';

export default defineConfig({
  root: 'public',
  base: '/',
  publicDir: '../public',
  envDir: '../',
  build: {
    outDir: '../dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false,
  },
  resolve: {
    alias: {
      '/game.ts': resolve(__dirname, 'src/game.ts'),
    },
  },
  plugins: [
    compression(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: '10m AI Gamedev Template',
        short_name: '10m Game',
        description:
          '10m AI Gamedev Template - A starting point for AI-assisted game development',
        theme_color: '#ffffff',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  server: {
    port: 3001,
    host: true,
  },
  preview: {
    port: 3001,
  },
});
