import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import swc from 'unplugin-swc';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const rootDir = fileURLToPath(new URL('.', import.meta.url));
const packagesDir = fileURLToPath(new URL('../../packages', import.meta.url));

const packageEntry = (name: string) => resolve(packagesDir, `${name}/src/index.ts`);

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    swc.vite({
      jsc: {
        parser: {
          syntax: 'typescript',
          decorators: true
        },
        transform: {
          decoratorVersion: '2022-03',
          useDefineForClassFields: false
        },
        target: 'esnext'
      }
    })
  ],
  root: 'src',
  publicDir: '../public',
  resolve: {
    alias: {
      '@easemate/web-kit': packageEntry('core')
    }
  },
  build: {
    outDir: '../build',
    emptyOutDir: true,
    copyPublicDir: true,
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      input: {
        index: resolve(rootDir, 'src/index.html')
      }
    }
  },
  server: {
    port: 3003,
    open: true,
    host: true
  },
  esbuild: false,
  optimizeDeps: {
    exclude: ['@easemate/web-kit', '@easemate/web-kit/*']
  }
});
