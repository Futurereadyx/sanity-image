import {
  createImageUrlBuilder,
  type ImageUrlBuilder,
  type SanityImageSource as BuilderSource,
} from '@sanity/image-url';
import { getImageDimensions, hasAsset } from './dimensions';
import type { ImageSize, ImageUrlOptions, SanityImageConfig, SanityImageSource } from './types';

export const DEFAULT_QUALITY = 90;

export function createUrlBuilder(config: SanityImageConfig): ImageUrlBuilder {
  return createImageUrlBuilder({
    projectId: config.projectId,
    dataset: config.dataset,
    baseUrl: config.baseUrl,
  });
}

function isComplete<T extends object>(value: T | null | undefined, keys: (keyof T)[]) {
  return Boolean(value) && keys.every((key) => typeof value?.[key] === 'number');
}

export function toBuilderSource(
  source: SanityImageSource | null | undefined,
): BuilderSource | undefined {
  const asset = source?.asset;
  if (!asset) return undefined;

  const ref = asset._ref || asset._id;
  const builderAsset = ref ? { _ref: ref } : asset.url ? { url: asset.url } : undefined;
  if (!builderAsset) return undefined;

  const crop = source?.crop;
  const hotspot = source?.hotspot;
  return {
    asset: builderAsset,
    ...(isComplete(crop, ['top', 'bottom', 'left', 'right']) ? { crop } : {}),
    ...(isComplete(hotspot, ['x', 'y', 'width', 'height']) ? { hotspot } : {}),
  } as BuilderSource;
}

// Sanity never upscales with fit=min/max, so asking for more than the (cropped)
// original only multiplies cache keys for identical pixels.
export function clampSize(source: SanityImageSource | null | undefined, size: ImageSize): ImageSize {
  const natural = getImageDimensions(source);
  if (!natural || !size.width || size.width <= natural.width) return size;

  const width = natural.width;
  const height = size.height ? Math.round((size.height / size.width) * width) : undefined;
  return { width, height };
}

export function resolveFit(size: ImageSize, fit?: ImageUrlOptions['fit']) {
  if (fit) return fit;
  return size.width && size.height ? 'min' : 'max';
}

export function urlFor(
  builder: ImageUrlBuilder,
  source: SanityImageSource | null | undefined,
  options: ImageUrlOptions = {},
): ImageUrlBuilder | undefined {
  const builderSource = toBuilderSource(source);
  if (!builderSource || !hasAsset(source)) return undefined;

  const size =
    options.clamp === false
      ? { width: options.width, height: options.height }
      : clampSize(source, { width: options.width, height: options.height });

  let chain = builder.image(builderSource).fit(resolveFit(size, options.fit));
  chain = options.format ? chain.format(options.format) : chain.auto('format');
  if (size.width) chain = chain.width(Math.round(size.width));
  if (size.height) chain = chain.height(Math.round(size.height));
  if (options.dpr && options.dpr !== 1) chain = chain.dpr(options.dpr);
  chain = chain.quality(options.quality ?? DEFAULT_QUALITY);
  return chain;
}

export function buildImageUrl(
  builder: ImageUrlBuilder,
  source: SanityImageSource | null | undefined,
  options: ImageUrlOptions = {},
): string | undefined {
  return urlFor(builder, source, options)?.url();
}
