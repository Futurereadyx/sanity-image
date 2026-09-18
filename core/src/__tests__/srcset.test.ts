import { describe, expect, it } from 'vitest';
import { createSanityImage } from '../index';

const { getImageProps } = createSanityImage({ projectId: 'abc123', dataset: 'production' });
const source = {
  asset: {
    _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x1000-jpg',
    metadata: { lqip: 'data:image/jpeg;base64,xyz' },
  },
};

const widthsOf = (srcSet: string) =>
  srcSet.split(', ').map((entry) => {
    const [url, descriptor] = entry.split(' ');
    return { w: Number(new URL(url).searchParams.get('w')), descriptor };
  });

describe('getImageProps', () => {
  it('emits width descriptors capped at the natural width when sizes is given', () => {
    const props = getImageProps(source, { sizes: '100vw' })!;
    const entries = widthsOf(props.srcSet);
    expect(entries.map((e) => e.descriptor)).toEqual(['640w', '750w', '828w', '1080w', '1200w', '1920w', '2000w']);
    expect(entries.every((e) => e.w <= 2000)).toBe(true);
    expect(props.width).toBe(2000);
    expect(props.height).toBe(1000);
    expect(props.placeholder).toBe(source.asset.metadata.lqip);
  });

  it('emits 1x/2x candidates for a fixed width', () => {
    const props = getImageProps(source, { width: 400, height: 300 })!;
    expect(widthsOf(props.srcSet)).toEqual([
      { w: 400, descriptor: '1x' },
      { w: 800, descriptor: '2x' },
    ]);
    expect(new URL(props.src).searchParams.get('h')).toBe('600');
    expect(new URL(props.src).searchParams.get('q')).toBe('90');
  });

  it('collapses density candidates the original cannot serve', () => {
    const props = getImageProps(source, { width: 1500 })!;
    expect(widthsOf(props.srcSet)).toEqual([
      { w: 1500, descriptor: '1x' },
      { w: 2000, descriptor: '1.33x' },
    ]);
    expect(props.height).toBe(750);
  });

  it('generates auto widths in steps up to the smaller of maxWidth and the original', () => {
    const props = getImageProps(source, { sizes: '100vw', widths: { maxWidth: 3840, step: 640 } })!;
    expect(widthsOf(props.srcSet).map((e) => e.w)).toEqual([640, 1280, 1920, 2000]);
    expect(getImageProps(source, { sizes: '100vw', widths: { maxWidth: 1000, step: 400 } })!.srcSet).toContain('w=1000&');
    expect(widthsOf(getImageProps(source, { sizes: '100vw', widths: { maxWidth: 1000, step: 400 } })!.srcSet).map((e) => e.w)).toEqual([400, 800, 1000]);
  });

  it('derives height from aspectRatio', () => {
    expect(getImageProps(source, { width: 300, aspectRatio: 3 })?.height).toBe(100);
  });

  it('returns undefined when nothing tells it the size', () => {
    expect(getImageProps({ asset: { _ref: 'broken' } })).toBeUndefined();
  });
});
