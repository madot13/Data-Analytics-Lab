# MADRID Lab website

Russian content guide with exact photo filenames, contacts and security setup: [CONTENT-GUIDE-RU.md](CONTENT-GUIDE-RU.md).

The site is built with Astro and TypeScript. Astro renders the complete one-page
site as static HTML; browser JavaScript is only used for the mobile menu,
publication filters and active navigation state.

## Local development

```sh
npm install
npm run dev
```

Open the local URL printed by Astro.

## Quality checks and production build

```sh
npm run check
npm run build
npm run preview
```

The production site is generated in `dist/`.

## Deploy to Cloudflare Workers

The project is configured as a static Cloudflare Worker named `madrid-lab`.
Publish it with:

```sh
npm run deploy
```

Cloudflare serves the generated `dist/` folder from the account's free
`workers.dev` subdomain. On the first run, `npx` installs Wrangler and Cloudflare
opens its secure sign-in flow.

## Basic security baseline

- `public/_headers` adds CSP, HSTS, clickjacking protection, MIME sniffing
  protection, a restrictive referrer policy and a limited Permissions Policy.
- Browser JavaScript is served as a local file, so the CSP does not need
  `unsafe-inline`.
- Member photos are restricted to local `public/` paths and content links to
  HTTPS URLs during the Astro check/build.
- Secrets and local Wrangler state are excluded by `.gitignore`. Keep Cloudflare
  MFA enabled and use a narrowly scoped API token if you later automate deploys.

The site is static and currently has no login, API or private data. These
headers protect the browser-facing surface; they do not replace consent for
publishing team photos or account security in Cloudflare.

## Editing content

- Lab details, navigation and research areas: `src/data/site.ts`
- Members: `src/data/members.json`
- Publications: `src/data/publications.json`
- Openings: `src/data/openings.json`
- News: `src/data/news.json`
- Blog posts: Markdown files in `src/content/blog/` (each post with text gets its own page at `/blog/<file-name>/`)

Each JSON entry has a unique `id`. Astro validates all entries against the
schemas in `src/content.config.ts` during the build.

## Member photos and LinkedIn

1. Add an optimized square WebP or AVIF photo to `public/images/members/`.
2. Set the member's `photo` value, for example:

   ```json
   "photo": "/images/members/member-name.webp"
   ```

3. Paste the exact public LinkedIn URL into `linkedin`.

When `photo` is `null`, the site looks for a file matching the member's `id`
(WebP, AVIF, JPG, JPEG, PNG) in that folder at build time, then falls back to initials.
`linkedin` and `email` set to `null` hide their buttons. Rebuild after adding photos.

## Legacy prototype

The original prototype remains at `legacy/index.html` as a reference while the
Astro migration is reviewed. Astro uses `src/pages/index.astro` as the live
source and does not include the legacy file in the production build.
