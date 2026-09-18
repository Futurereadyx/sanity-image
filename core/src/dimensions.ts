import type { SanityImageDimensions, SanityImageSource } from './types';

const ASSET_SIZE_PATTERN = /-(\d+)x(\d+)(?:[-.]|$)/;

export function hasAsset(source: SanityImageSource | null | undefined): boolean {
  const asset = source?.asset;
  return Boolean(asset?._ref || asset?._id || asset?.url);
}

export function parseAssetDimensions(idOrUrl: string): SanityImageDimensions | undefined {
  const match = ASSET_SIZE_PATTERN.exec(idOrUrl);
  if (!match) return undefined;
  const width = Number(match[1]);
  const height = Number(match[2]);
  if (!width || !height) return undefined;
  return { width, height, aspectRatio: width / height };
}

export function getAssetDimensions(
  source: SanityImageSource | null | undefined,
): SanityImageDimensions | undefined {
  const asset = source?.asset;
  if (!asset) return undefined;

  const meta = asset.metadata?.dimensions;
  if (meta?.width && meta?.height) {
    return {
      width: meta.width,
      height: meta.height,
      aspectRatio: meta.aspectRatio || meta.width / meta.height,
    };
  }

  for (const candidate of [asset._ref, asset._id, asset.url]) {
    if (!candidate) continue;
    const parsed = parseAssetDimensions(candidate);
    if (parsed) return parsed;
  }
  return undefined;
}

export function getImageDimensions(
  source: SanityImageSource | null | undefined,
): SanityImageDimensions | undefined {
  const natural = getAssetDimensions(source);
  if (!natural) return undefined;

  const crop = source?.crop;
  if (!crop) return natural;
  if (![crop.top, crop.bottom, crop.left, crop.right].some((v) => typeof v === 'number')) return natural;

  const left = Math.round((crop.left ?? 0) * natural.width);
  const top = Math.round((crop.top ?? 0) * natural.height);
  const width = Math.round(natural.width - (crop.right ?? 0) * natural.width - left);
  const height = Math.round(natural.height - (crop.bottom ?? 0) * natural.height - top);
  if (width <= 0 || height <= 0) return natural;

  return { width, height, aspectRatio: width / height };
}
