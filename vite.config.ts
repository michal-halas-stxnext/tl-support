import { defineConfig } from 'vitest/config';
import preact from '@preact/preset-vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.config.ts';

export default defineConfig({
  plugins: [preact(), crx({ manifest })],
  build: { outDir: process.env.TARGET === 'firefox' ? 'dist-firefox' : 'dist' },
  server: { port: 5173, strictPort: true, cors: true },
  test: { environment: 'jsdom', include: ['src/**/*.test.{ts,tsx}'] },
});
