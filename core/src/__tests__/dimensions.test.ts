import { describe, expect, it } from 'vitest';
import { getAssetDimensions, getImageDimensions, hasAsset, parseAssetDimensions } from '../dimensions';

const ref = 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x1000-jpg';

describe('parseAssetDimensions', () => {
  it('reads the size out of a _ref', () => {
    expect(parseAssetDimensions(ref)).toEqual({ width: 2000, height: 1000, aspectRatio: 2 });
  });

  it('reads the size out of a CDN url', () => {
    expect(
      parseAssetDimensions('https://cdn.sanity.io/images/p/d/Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x1000.jpg'),
    ).toEqual({ width: 2000, height: 1000, aspectRatio: 2 });
  });

  it('returns undefined for garbage', () => {
    expect(parseAssetDimensions('nope')).toBeUndefined();
  });
});

describe('getAssetDimensions', () => {
  it('prefers metadata over the ref', () => {
    expect(
      getAssetDimensions({
        asset: { _ref: ref, metadata: { dimensions: { width: 1200, height: 600, aspectRatio: 2 } } },
      }),
    ).toEqual({ width: 1200, height: 600, aspectRatio: 2 });
  });

  it('falls back to the ref when metadata is missing', () => {
    expect(getAssetDimensions({ asset: { _ref: ref } })).toEqual({
      width: 2000,
      height: 1000,
      aspectRatio: 2,
    });
  });
});

describe('getImageDimensions', () => {
  it('applies a fractional crop', () => {
    const dims = getImageDimensions({
      asset: { _ref: ref },
      crop: { top: 0.1, bottom: 0.1, left: 0.25, right: 0.25 },
    });
    expect(dims).toEqual({ width: 1000, height: 800, aspectRatio: 1.25 });
  });

  it('ignores a null crop', () => {
    expect(getImageDimensions({ asset: { _ref: ref }, crop: null })?.width).toBe(2000);
  });
});

describe('hasAsset', () => {
  it('accepts _ref, _id or url', () => {
    expect(hasAsset({ asset: { _ref: ref } })).toBe(true);
    expect(hasAsset({ asset: { _id: ref } })).toBe(true);
    expect(hasAsset({ asset: { url: 'https://cdn.sanity.io/x' } })).toBe(true);
    expect(hasAsset({ asset: null })).toBe(false);
    expect(hasAsset(undefined)).toBe(false);
  });
});
