import { defineConfig } from 'tsup';
import swc from 'unplugin-swc';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    elements: 'src/elements/index.ts',
    decorators: 'src/decorators/index.ts',
    utils: 'src/utils/index.ts',
    theme: 'src/theme/index.ts',
    react: 'src/react/index.ts',
    jsx: 'src/react/jsx.ts',
    register: 'src/register.ts',
    'register.server': 'src/register.server.ts',
  },
  format: ['esm', 'cjs'],
  // resolve: true bundles/resolves declarations so path aliases don't leak
  dts: { resolve: true },
  splitting: false,
  sourcemap: true,
  clean: true,
  outDir: 'build',
  // External dependencies that shouldn't be bundled
  external: ['react', 'react-dom', 'lit-html'],
  
  // Use SWC for TC39 Stage 3 decorator compilation
  esbuildPlugins: [
    swc.esbuild({
      jsc: {
        parser: {
          syntax: 'typescript',
          decorators: true,
        },
        transform: {
          decoratorVersion: '2022-03',
          useDefineForClassFields: false,
        },
        target: 'esnext',
      },
    }),
  ],
  
  // Disable esbuild's native transformation since SWC handles it
  esbuildOptions(options) {
    options.loader = {
      '.ts': 'ts',
    };
  },
});
