import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import {writeSitemaps} from './scripts/generate-sitemap.ts';
import {htmlSeoPlugin} from './scripts/html-seo-plugin.ts';

function sitemapBuildPlugin(): Plugin {
  return {
    name: 'sitemap-build-generator',
    buildStart() {
      try {
        writeSitemaps();
      } catch (err) {
        console.warn('[vite:sitemap] Error generating sitemap on buildStart:', err);
      }
    },
    closeBundle() {
      try {
        writeSitemaps();
      } catch (err) {
        console.warn('[vite:sitemap] Error mirroring sitemap on closeBundle:', err);
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [sitemapBuildPlugin(), htmlSeoPlugin(), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
