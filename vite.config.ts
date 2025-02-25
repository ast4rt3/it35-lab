import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  base: "/it35-lab/", 
  plugins: [react(), legacy()],
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});
