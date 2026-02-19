# DevTools

Fast, privacy-first developer utilities. Everything runs entirely in your browser — no data is ever sent to a server.

**Live site:** https://wsgrok.com

## Tools

| Tool | Description |
|---|---|
| **Base64** | Encode text to Base64 or decode Base64 strings back to plain text |
| **URL Encoder** | Percent-encode URLs and query parameters, or decode them back |
| **JSON Formatter** | Prettify, minify, and validate JSON with optional key sorting |
| **JSON Escape** | Escape raw strings for safe embedding as JSON values, or unescape them |
| **Regex Tester** | Test regular expressions with live match highlighting and capture group inspection |
| **JWT** | Decode, sign, and verify JWTs with HMAC algorithms (HS256/384/512) |
| **JWT RSA** | Sign and verify JWTs with RSA keys — RS256/384/512 and PS256/384/512 |
| **Hex** | Convert text to hexadecimal or decode hex back to plain text |
| **Hash** | Compute MD5, SHA-1, SHA-256/512, SHA3, RIPEMD-160 hashes from text or files |
| **UUID Generator** | Generate v1, v4, and v5 UUIDs in bulk |

## Tech Stack

- [SvelteKit](https://kit.svelte.dev) + [TypeScript](https://www.typescriptlang.org)
- [Skeleton UI](https://www.skeleton.dev) + [Tailwind CSS](https://tailwindcss.com)
- [@noble/hashes](https://github.com/paulmillr/noble-hashes) for cryptographic hashing
- Deployed to [Firebase Hosting](https://firebase.google.com/products/hosting)

## Development

```bash
npm install
npm run dev
```

## Build & Deploy

```bash
npm run build
```

Deployment is handled automatically via GitHub Actions on every push to `main`.
