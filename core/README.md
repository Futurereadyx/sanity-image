# @frx/sanity-image

Framework-agnostic helpers for rendering Sanity images sharply: URL building with the right defaults, hotspot/crop-aware sizing, srcset generation, LQIP placeholders and a GROQ projection helper. Framework adapters (`@frx/next-sanity-image`, …) build on this package.

## Defaults baked in

- `auto=format` so the CDN serves AVIF/WebP when the browser supports it.
- `q=90` (`DEFAULT_QUALITY`). q=75 visibly softens flat colour, screenshots and logos on 2x displays.
- `fit=min` when both width and height are requested (exact-aspect crop through the image's hotspot, never upscaled), `fit=max` otherwise.
- Requested widths are clamped to the cropped original. Sanity never upscales, so anything larger only multiplies cache keys.

## Query

```ts
import { imageProjection } from '@frx/sanity-image';

const query = `*[_type == "article"]{ title, ${imageProjection('coverImage')} }`;
// "coverImage": coverImage { _type, alt, hotspot, crop, asset-> { _id, url, metadata { dimensions, lqip } } }

imageProjection('hero.image', { as: 'heroImage', assetFields: ['originalFilename'] });
```

That projection is everything the helpers use. Without `metadata.dimensions` the size is parsed from the asset `_ref`; `asset.url` also lets adapters infer the project and dataset.

## Usage

```ts
import { createSanityImage } from '@frx/sanity-image';

const sanityImage = createSanityImage({ projectId: 'abc123', dataset: 'production' });

sanityImage.imageUrl(image, { width: 800, height: 600 });
// https://cdn.sanity.io/images/abc123/production/<id>-2000x1000.jpg?rect=…&fit=min&auto=format&w=800&h=600&q=90

sanityImage.urlFor(image)?.blur(50).url();       // chain further on the @sanity/image-url builder
sanityImage.getImageDimensions(image);            // cropped natural size, from metadata or the asset _ref
sanityImage.getImageProps(image, { sizes: '100vw' });
// { src, srcSet: '…640w, …750w, …', sizes, width, height, placeholder: lqip }
sanityImage.getImageProps(image, { sizes: '100vw', widths: { maxWidth: 3840, step: 640 } });
// widths 640, 1280, 1920, … up to the smaller of maxWidth and the original
```

## API

| Export | Purpose |
| --- | --- |
| `createSanityImage(config)` | Binds everything below to a project. `config.quality` overrides the default. |
| `imageProjection(field, { as?, assetFields? })` | GROQ fragment fetching the fields the helpers need. |
| `buildImageUrl(builder, source, options)` | One URL. `options`: `width`, `height`, `quality`, `fit`, `dpr`, `format`, `clamp`. |
| `urlFor(builder, source, options)` | Same, but returns the builder for further chaining. |
| `getImageProps(builder, source, options)` | `src`/`srcSet`/`sizes`/`width`/`height`/`placeholder` for a plain `<img>`. Width descriptors when `sizes` is given, 1x/2x otherwise. `widths` is a list or `{ maxWidth, step }`. |
| `getImageDimensions(source)` | Natural size with the editor's crop applied. |
| `getAssetDimensions(source)` | Natural size before crop. |
| `getPlaceholder(source)` | The LQIP data URL, if projected. |
| `parseAssetUrl(url)` | `{ projectId, dataset }` from a CDN url. |
| `clampSize`, `resolveFit`, `resolveWidths`, `toBuilderSource`, `hasAsset`, `parseAssetDimensions` | Lower-level pieces used by adapters. |

Editorial rule of thumb: upload at least twice the widest slot an image fills. A full-bleed hero on a 1440px 2x laptop wants ~2880px; the CDN will not invent pixels that are not there.
