import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import swc from 'unplugin-swc';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

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
  resolve: {
    alias: {
      '@easemate/web-kit': packageEntry('core'),
      '@/*': packageEntry('core/src/decorators/*'),
      '~/*': packageEntry('core/src/*')
    }
  },
  esbuild: false
});
