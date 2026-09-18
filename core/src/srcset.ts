import type { ImageUrlBuilder } from '@sanity/image-url';
import { getImageDimensions } from './dimensions';
import { getPlaceholder } from './placeholder';
import type { AutoWidths, ImageProps, ImagePropsOptions, SanityImageSource } from './types';
import { buildImageUrl } from './url';

export const DEFAULT_WIDTHS = [640, 750, 828, 1080, 1200, 1920, 2048, 3840] as const;
export const DEFAULT_DENSITIES = [1, 2] as const;

type Candidate = { width: number; descriptor: string };

function unique(widths: number[]) {
  return Array.from(new Set(widths.map((w) => Math.round(w)).filter((w) => w > 0))).sort(
    (a, b) => a - b,
  );
}

export function resolveWidths(widths: readonly number[] | AutoWidths, naturalWidth: number): number[] {
  const isAuto = !Array.isArray(widths);
  const cap = isAuto ? Math.min((widths as AutoWidths).maxWidth, naturalWidth) : naturalWidth;
  const list = isAuto
    ? Array.from({ length: Math.max(0, Math.ceil(cap / (widths as AutoWidths).step) - 1) }, (_, i) => (i + 1) * (widths as AutoWidths).step)
    : [...(widths as readonly number[])].filter((w) => w <= cap);
  const result = unique(list);
  if (result.length === 0 || result[result.length - 1] < cap) result.push(cap);
  return result;
}

export function getImageProps(
  builder: ImageUrlBuilder,
  source: SanityImageSource | null | undefined,
  options: ImagePropsOptions = {},
): ImageProps | undefined {
  const natural = getImageDimensions(source);
  if (!natural) return undefined;

  const aspectRatio =
    options.aspectRatio ??
    (options.width && options.height ? options.width / options.height : natural.aspectRatio);

  const width =
    options.width ?? (options.height ? Math.round(options.height * aspectRatio) : natural.width);
  const height = options.height ?? Math.round(width / aspectRatio);

  const maxWidth = natural.width;
  let candidates: Candidate[];

  if (options.sizes) {
    const widths = resolveWidths(options.widths ?? DEFAULT_WIDTHS, maxWidth);
    candidates = widths.map((w) => ({ width: w, descriptor: `${w}w` }));
  } else {
    const widths = unique(
      (options.densities ?? DEFAULT_DENSITIES).map((d) => Math.min(width * d, maxWidth)),
    );
    candidates = widths.map((w) => ({
      width: w,
      descriptor: `${Number((w / width).toFixed(2))}x`,
    }));
  }

  const url = (w: number) =>
    buildImageUrl(builder, source, {
      width: w,
      height: Math.round(w / aspectRatio),
      quality: options.quality,
    }) ?? '';

  const srcSet = candidates.map((c) => `${url(c.width)} ${c.descriptor}`).join(', ');
  const src = url(candidates[candidates.length - 1].width);

  return {
    src,
    srcSet,
    sizes: options.sizes,
    width,
    height,
    placeholder: getPlaceholder(source),
  };
}
