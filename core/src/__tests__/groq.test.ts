import { describe, expect, it } from 'vitest';
import { imageProjection } from '../groq';
import { parseAssetUrl } from '../asset';

describe('imageProjection', () => {
  it('projects the fields the helpers need', () => {
    expect(imageProjection('coverImage')).toBe(
      '"coverImage": coverImage { _type, alt, hotspot, crop, asset-> { _id, url, metadata { dimensions, lqip } } }',
    );
  });

  it('supports an alias and extra asset fields', () => {
    expect(imageProjection('hero.image', { as: 'heroImage', assetFields: ['originalFilename'] })).toBe(
      '"heroImage": hero.image { _type, alt, hotspot, crop, asset-> { _id, url, metadata { dimensions, lqip }, originalFilename } }',
    );
  });
});

describe('parseAssetUrl', () => {
  it('reads project and dataset from a CDN url', () => {
    expect(parseAssetUrl('https://cdn.sanity.io/images/abc123/production/x-10x10.jpg')).toEqual({
      projectId: 'abc123',
      dataset: 'production',
    });
  });

  it('returns undefined otherwise', () => {
    expect(parseAssetUrl('https://example.com/x.jpg')).toBeUndefined();
    expect(parseAssetUrl(null)).toBeUndefined();
  });
});
