/**
 * Server-side no-op for @easemate/web-kit/register
 *
 * This module is used in server environments (Node.js, React Server Components)
 * to prevent the actual component registration code from running on the server,
 * which would cause errors due to missing `window` and `customElements` APIs.
 *
 * The conditional export in package.json routes server environments to this file
 * while browser environments get the real register.ts with side effects.
 *
 * @module @easemate/web-kit/register (server)
 */

// No-op export for server environments
export {};
