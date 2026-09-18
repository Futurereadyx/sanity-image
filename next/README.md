# @frx/next-sanity-image

`next/image` for Sanity, done right: q=90, hotspot-aware crops, no CDN upscaling, LQIP blur placeholders and a `sizes`-driven srcset that keeps retina screens sharp. Built on `@frx/sanity-image`.

## Zero-config usage

```tsx
import { SanityImage } from '@frx/next-sanity-image';

<SanityImage image={coverImage} alt="" width={396} height={316} sizes="(min-width: 1024px) 396px, 100vw" />
```

The component finds the project on its own, in this order:

1. `projectId` / `dataset` props on the element.
2. `NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET` environment variables.
3. The `asset.url` of the image, when your query projects it (see `imageProjection` in the core).

In development a missing config throws with a clear message; in production the image renders as `null`.

For a fixed setup, or several projects, create your own component:

```tsx
import { createSanityImageComponent } from '@frx/next-sanity-image';

export const SanityImage = createSanityImageComponent({ projectId: 'abc123', dataset: 'production', quality: 90 });
```

Make sure the quality you use is allowed in `next.config.ts` (`images.qualities: [75, 90]`).

## Patterns

```tsx
// Fixed box: the CDN crops to 396×316 through the hotspot; Next adds 1x/2x candidates.
<SanityImage image={coverImage} alt="" width={396} height={316} className="object-cover" />

// Natural size (from asset metadata or the _ref), responsive srcset from `sizes`.
<SanityImage image={illustration} alt="" sizes="(min-width: 1024px) 560px, 100vw" />

// Fill a positioned parent. Always pass `sizes`, otherwise Next assumes 100vw.
<SanityImage image={hero} alt="" fill sizes="100vw" className="object-cover" />

// Width plus aspect ratio.
<SanityImage image={logo} alt="" width={200} aspectRatio={3} />
```

The component renders `null` when the image has no asset, so callers do not need their own guard.

Server-side URL helpers share the same config resolution:

```ts
import { urlFor, imageUrl } from '@frx/next-sanity-image';

imageUrl(image, { width: 1200, height: 630, fit: 'crop', clamp: false }); // e.g. Open Graph
urlFor(image)?.blur(40).url();
```

## Props

Everything `next/image` accepts except `src`/`loader`, plus:

| Prop | Notes |
| --- | --- |
| `image` | The Sanity image object `{ asset, hotspot?, crop? }`. Preferred over `src`. |
| `src` | Escape hatch for a prebuilt CDN URL. |
| `width`, `height` | Optional. Derived from the cropped natural size when omitted. Both present means the CDN crops to that box. |
| `aspectRatio` | Shorthand to derive the missing dimension. |
| `projectId`, `dataset` | Override the resolved project for this element. |
| `quality` | Defaults to 90. |
| `placeholder`, `blurDataURL` | Defaults to `blur` with the asset's LQIP when it is projected and the image is at least 40px. Pass `placeholder="empty"` to opt out. |

## How it stays sharp

- The loader rewrites `w` to Next's chosen breakpoint and scales `h` with it, so the crop aspect is preserved across the whole srcset.
- Every candidate carries `q=90` and `auto=format`.
- The natural width rides along in the URL hash (`#nw=2400`); the loader clamps to it and strips it. Nothing above the original is ever requested.
- `SanityImageClient` and `sanityImageLoader` are exported for cases where you want `next/image` directly with a Sanity URL.

One browser detail worth knowing: when an upload is smaller than a srcset descriptor promises, Chrome scales the image's reported intrinsic size down. Give images an explicit width or height in CSS rather than leaving both `auto`.
