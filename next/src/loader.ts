import type { ImageLoader } from 'next/image';

const NATURAL_WIDTH_KEY = 'nw';

// The hint travels in the hash so it never reaches the CDN and the loader can
// stay a module-level function (a per-image closure cannot cross the RSC boundary).
export function withNaturalWidth(url: string, naturalWidth: number | undefined): string {
  if (!naturalWidth) return url;
  const parsed = new URL(url);
  parsed.hash = `${NATURAL_WIDTH_KEY}=${Math.round(naturalWidth)}`;
  return parsed.href;
}

function readNaturalWidth(url: URL): number | undefined {
  const match = new RegExp(`^#?${NATURAL_WIDTH_KEY}=(\\d+)$`).exec(url.hash);
  return match ? Number(match[1]) : undefined;
}

export const sanityImageLoader: ImageLoader = ({ src, width, quality }) => {
  const url = new URL(src);
  const naturalWidth = readNaturalWidth(url);
  url.hash = '';

  const targetWidth = naturalWidth ? Math.min(width, naturalWidth) : width;
  const currentWidth = Number(url.searchParams.get('w'));
  const currentHeight = Number(url.searchParams.get('h'));

  if (!url.searchParams.has('auto') && !url.searchParams.has('fm')) {
    url.searchParams.set('auto', 'format');
  }
  if (!url.searchParams.has('fit')) {
    url.searchParams.set('fit', currentHeight ? 'min' : 'max');
  }
  if (currentWidth && currentHeight) {
    url.searchParams.set('h', String(Math.round((currentHeight / currentWidth) * targetWidth)));
  }
  url.searchParams.set('w', String(targetWidth));
  if (quality) url.searchParams.set('q', String(quality));

  return url.href;
};
