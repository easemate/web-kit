<h1>@easemate/web-kit</h1>

<div align="center">
  <img src="https://easemate.app/easemate-web-kit-header.png" alt="@easemate/web-kit" />
</div>

<br />

Monorepo for `@easemate/web-kit` — a modern, framework-agnostic UI kit of web components containing input element, controls, an easing curve editor & more.

<div>

[![npm version](https://img.shields.io/npm/v/@easemate/web-kit.svg?style=flat-square)](https://www.npmjs.com/package/@easemate/web-kit)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@easemate/web-kit?style=flat-square&label=bundle%20size)](https://bundlephobia.com/package/@easemate/web-kit)
[![npm downloads](https://img.shields.io/npm/dm/@easemate/web-kit.svg?style=flat-square)](https://www.npmjs.com/package/@easemate/web-kit)
[![license](https://img.shields.io/npm/l/@easemate/web-kit.svg?style=flat-square)](https://github.com/easemate/web-kit/blob/main/LICENSE)

</div>

## Packages

| Package | Description |
|---------|-------------|
| [`@easemate/web-kit`](./packages/core) | Core UI component library |
| [`demo`](./apps/demo) | Interactive demo application |

## Quick Start

```bash
# Install dependencies
npm install

# Start development (runs core package dev server)
npm run dev

# Build all packages
npm run build

# Run tests
npm run test

# Lint code
npm run lint
```

## Development

This project uses:
- **npm workspaces** for package management
- **Turborepo** for build orchestration
- **TypeScript** for type safety
- **Vite** for development and building
- **Vitest** for testing
- **Biome** for linting and formatting

### Project Structure

```
web-kit/
├── packages/
│   └── core/          # @easemate/web-kit - main component library
├── apps/
│   └── demo/          # Interactive demo application
├── package.json       # Root workspace config
└── turbo.json         # Turborepo config
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server for core package |
| `npm run build` | Build all packages |
| `npm run test` | Run all tests |
| `npm run lint` | Lint all packages |
| `npm run lint:fix` | Fix lint errors |
| `npm run typecheck` | Type check all packages |
| `npm run clean` | Clean build artifacts |

## Documentation

See the [core package README](./packages/core/README.md) for full documentation on:
- Installation and setup
- Available components
- Theming and customization
- API reference

## License

MIT © [Aaron Iker](https://github.com/aaroniker)



