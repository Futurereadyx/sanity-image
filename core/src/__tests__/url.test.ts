import { describe, expect, it } from 'vitest';
import { buildImageUrl, clampSize, createUrlBuilder, resolveFit } from '../url';

const builder = createUrlBuilder({ projectId: 'abc123', dataset: 'production' });
const ref = 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x1000-jpg';
const source = { asset: { _ref: ref } };

const params = (url: string) => Object.fromEntries(new URL(url).searchParams);

describe('buildImageUrl', () => {
  it('returns undefined without an asset', () => {
    expect(buildImageUrl(builder, { asset: null })).toBeUndefined();
    expect(buildImageUrl(builder, undefined)).toBeUndefined();
  });

  it('defaults to auto=format, fit=max and q=90', () => {
    const url = buildImageUrl(builder, source)!;
    expect(url.startsWith('https://cdn.sanity.io/images/abc123/production/')).toBe(true);
    expect(params(url)).toMatchObject({ auto: 'format', fit: 'max', q: '90' });
  });

  it('uses fit=min when both width and height are given', () => {
    expect(params(buildImageUrl(builder, source, { width: 400, height: 300 })!)).toMatchObject({
      fit: 'min',
      w: '400',
      h: '300',
    });
  });

  it('crops through the hotspot when the box aspect differs', () => {
    const url = buildImageUrl(
      builder,
      { ...source, hotspot: { x: 0.9, y: 0.5, width: 0.1, height: 0.1 } },
      { width: 500, height: 500 },
    )!;
    expect(params(url).rect).toBe('1000,0,1000,1000');
  });

  it('never asks the CDN for more than the original width', () => {
    expect(params(buildImageUrl(builder, source, { width: 4000, height: 2000 })!)).toMatchObject({
      w: '2000',
      h: '1000',
    });
  });

  it('honours an explicit fit, quality and format', () => {
    const url = buildImageUrl(builder, source, { width: 10, height: 10, fit: 'crop', quality: 60, format: 'png' })!;
    expect(params(url)).toMatchObject({ fit: 'crop', q: '60', fm: 'png' });
    expect(params(url).auto).toBeUndefined();
  });

  it('builds from an asset url stub', () => {
    const url = buildImageUrl(builder, {
      asset: { url: 'https://cdn.sanity.io/images/abc123/production/Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x1000.jpg' },
    });
    expect(url).toContain('Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x1000.jpg');
  });
});

describe('clampSize', () => {
  it('scales height with the clamped width', () => {
    expect(clampSize(source, { width: 4000, height: 3000 })).toEqual({ width: 2000, height: 1500 });
  });

  it('leaves smaller requests alone', () => {
    expect(clampSize(source, { width: 100 })).toEqual({ width: 100 });
  });
});

describe('resolveFit', () => {
  it('picks min only when both dimensions are constrained', () => {
    expect(resolveFit({ width: 1, height: 1 })).toBe('min');
    expect(resolveFit({ width: 1 })).toBe('max');
    expect(resolveFit({}, 'crop')).toBe('crop');
  });
});
