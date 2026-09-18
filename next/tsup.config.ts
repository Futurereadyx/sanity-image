import { defineConfig } from 'tsup';
import type { Plugin } from 'esbuild';

// client-image.tsx is the only 'use client' module. Bundling it into index would
// drop the directive, so it is built as its own entry and index links to it.
const clientImageExternal: Plugin = {
  name: 'client-image-external',
  setup(build) {
    build.onResolve({ filter: /^\.\/client-image$/ }, () => ({ path: './client-image.js', external: true }));
  },
};

export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    format: ['esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    target: 'es2022',
    external: ['react', 'next', 'next/image', '@frx/sanity-image'],
    esbuildPlugins: [clientImageExternal],
  },
  {
    entry: { 'client-image': 'src/client-image.tsx' },
    format: ['esm'],
    dts: true,
    sourcemap: true,
    target: 'es2022',
    external: ['react', 'next', 'next/image'],
    banner: { js: "'use client';" },
  },
]);
