import { createUrlBuilder, DEFAULT_QUALITY, buildImageUrl, urlFor } from './url';
import { getImageProps } from './srcset';
import { getImageDimensions } from './dimensions';
import { getPlaceholder } from './placeholder';
import type { ImagePropsOptions, ImageUrlOptions, SanityImageConfig, SanityImageSource } from './types';

export * from './types';
export { getAssetDimensions, getImageDimensions, hasAsset, parseAssetDimensions } from './dimensions';
export { getPlaceholder } from './placeholder';
export {
  buildImageUrl,
  clampSize,
  createUrlBuilder,
  DEFAULT_QUALITY,
  resolveFit,
  toBuilderSource,
  urlFor,
} from './url';
export { DEFAULT_DENSITIES, DEFAULT_WIDTHS, getImageProps, resolveWidths } from './srcset';
export { imageProjection } from './groq';
export type { ImageProjectionOptions } from './groq';
export { parseAssetUrl } from './asset';

export function createSanityImage(config: SanityImageConfig) {
  const builder = createUrlBuilder(config);
  const quality = config.quality ?? DEFAULT_QUALITY;

  return {
    builder,
    quality,
    urlFor: (source: SanityImageSource | null | undefined, options?: ImageUrlOptions) =>
      urlFor(builder, source, { quality, ...options }),
    imageUrl: (source: SanityImageSource | null | undefined, options?: ImageUrlOptions) =>
      buildImageUrl(builder, source, { quality, ...options }),
    getImageProps: (source: SanityImageSource | null | undefined, options?: ImagePropsOptions) =>
      getImageProps(builder, source, { quality, ...options }),
    getImageDimensions,
    getPlaceholder,
  };
}

export type SanityImageClient = ReturnType<typeof createSanityImage>;
