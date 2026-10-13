import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // lucide-react must stay pre-bundled: unbundled, each icon is served as its
  // own file, and ad blockers block icons/fingerprint.js — a white screen.
  server: {
    port: 3000,
  }
});