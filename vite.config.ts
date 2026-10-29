import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const cesiumSource = 'node_modules/cesium/Build/Cesium';
// Relative base so the build works on GitHub Pages sub-paths and from file servers.
const base = process.env.BASE_PATH ?? './';

export default defineConfig({
  base,
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: `${cesiumSource}/ThirdParty`, dest: 'cesium' },
        { src: `${cesiumSource}/Workers`, dest: 'cesium' },
        { src: `${cesiumSource}/Assets`, dest: 'cesium' },
        { src: `${cesiumSource}/Widgets`, dest: 'cesium' },
      ],
    }),
  ],
  define: {
    CESIUM_BASE_URL: JSON.stringify(`${base}cesium`),
    // Changes on every build, so files served under a fixed name (the logo) are fetched fresh after a deploy.
    'import.meta.env.VITE_BUILD_ID': JSON.stringify(Date.now().toString(36)),
  },
  build: {
    chunkSizeWarningLimit: 6000,
    rollupOptions: {
      output: {
        // Cesium in its own chunk, loaded only with the simulator tab. Bundler helpers go to a
        // small chunk of their own: left alone, Rollup puts them in the Cesium chunk (which uses
        // them too) and the link page would then have to download all of Cesium.
        manualChunks: (id) => {
          if (/[\\/]node_modules[\\/]@?cesium[\\/]/.test(id)) return 'cesium';
          if (/commonjsHelpers|preload-helper|[\\/]node_modules[\\/]tslib[\\/]/.test(id)) return 'helpers';
        },
      },
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
