# sanity-image

Sharp, responsive Sanity images for every front end we build. One framework-agnostic core, one thin adapter per framework.

| Package | Folder | Status |
| --- | --- | --- |
| `@frx/sanity-image` | `core/` | ready |
| `@frx/next-sanity-image` | `next/` | ready |
| `@frx/react-sanity-image` | `react/` | planned |
| `@frx/astro-sanity-image` | `astro/` | planned |
| `@frx/svelte-sanity-image` | `svelte/` | planned |

The core owns URL building (q=90, `auto=format`, hotspot-aware `fit=min`, no CDN upscaling), crop-aware dimensions, srcset generation, LQIP placeholders and the `imageProjection` GROQ helper. Adapters only translate that into a framework's image primitive.

## Using it inside this app (before publishing)

The packages are plain source folders resolved through tsconfig `paths`, under the exact names they will have on npm:

```ts
import { SanityImage, urlFor } from '@frx/next-sanity-image';
import { imageProjection } from '@frx/sanity-image';
```

Rules that keep them extractable (enforced by ESLint in `eslint.config.mjs`):

- Nothing in `lib/` imports app code (`@/...`).
- `core/` never imports Next or React and never reads `process.env`.
- `next/` may read `NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET`, the Next convention.

## Publishing checklist

1. Move this folder to its own repository (`sanity-image`), add `pnpm-workspace.yaml` with `packages: ['core', 'next', …]`.
2. Add a `tsup` build per package (`--format esm --dts`; the Next package needs `banner: { js: "'use client';" }` for `client-image.tsx`), flip `exports` from `./src/index.ts` to `./dist/index.js` + `.d.ts`, and set `files` to `dist`.
3. In consuming apps replace the tsconfig `paths` entries with dependencies. No import changes.

## Adapter blueprints

**React (`react/`)**: `getImageProps` from the core → `<img src srcSet sizes width height>` with the LQIP as an inline background until load. No framework image pipeline to defer to, so the adapter also owns lazy loading (`loading="lazy"`, `decoding="async"`).

**Astro (`astro/`)**, modelled on `otterdev-io/sanity-img`: a `SanityImg.astro` that calls `getImageProps` and spreads the result onto `<img>`, plus an optional integration that binds the project once:

```ts
// astro.config.mjs
integrations: [sanity({ projectId, dataset }), sanityImage({ quality: 90 })]
```

The integration uses `injectScript('page-ssr', …)` (and `before-hydration` for island components) to create the core client from `@sanity/astro`'s `sanity:client`, so pages never pass config. Fallback order matches the Next adapter: explicit props, then the integration, then `asset.url`.

**Svelte (`svelte/`)**: same core call in a `.svelte` component; read defaults from a module-level store set by the host app.
