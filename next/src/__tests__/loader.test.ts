import { describe, expect, it } from 'vitest';
import { sanityImageLoader, withNaturalWidth } from '../loader';

const base = 'https://cdn.sanity.io/images/abc123/production/Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x1000.jpg';
const params = (url: string) => Object.fromEntries(new URL(url).searchParams);

describe('sanityImageLoader', () => {
  it('sets w, q and auto=format on a bare url', () => {
    const url = sanityImageLoader({ src: base, width: 640, quality: 90 });
    expect(params(url)).toEqual({ w: '640', q: '90', auto: 'format', fit: 'max' });
  });

  it('scales h with w and keeps fit=min when a box was requested', () => {
    const url = sanityImageLoader({ src: `${base}?w=400&h=300&fit=min`, width: 800, quality: 90 });
    expect(params(url)).toMatchObject({ w: '800', h: '600', fit: 'min' });
  });

  it('clamps to the natural width hint and strips the hash', () => {
    const src = withNaturalWidth(`${base}?w=400&h=300`, 1000);
    const url = sanityImageLoader({ src, width: 3840, quality: 90 });
    expect(params(url)).toMatchObject({ w: '1000', h: '750' });
    expect(new URL(url).hash).toBe('');
  });

  it('keeps an explicit format instead of forcing auto', () => {
    const url = sanityImageLoader({ src: `${base}?fm=png`, width: 100 });
    expect(params(url).auto).toBeUndefined();
    expect(params(url).fm).toBe('png');
  });
});
