import swc from 'unplugin-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  assetsInclude: ['**/*.svg'],
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
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['test/**/*.test.ts']
  },
  esbuild: false
});
