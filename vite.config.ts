import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solidPlugin()],
  // relative base so dynamic-import preloads resolve via import.meta.url —
  // works under any deploy subpath (GitHub project Pages serves at /<repo>/)
  base: './',
  build: {
    outDir: './bundled',
    cssMinify: 'esbuild',
    watch: process.env.DISABLE_WATCH
      ? null
      : {
          include: 'assets/**'
        },
    rollupOptions: {
      input: {
        main: './assets/ts/main.tsx',
        critical: './assets/ts/critical.ts'
      },
      output: {
        format: 'es',
        entryFileNames: 'js/[name].js',
        chunkFileNames: 'js/[hash:6].js',
        assetFileNames: '[ext]/[name].[ext]'
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: ['./assets/scss']
      }
    }
  }
})
