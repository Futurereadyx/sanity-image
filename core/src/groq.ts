export type ImageProjectionOptions = {
  as?: string;
  assetFields?: readonly string[];
};

// Fetches exactly what the image helpers need; splatting the asset (`asset->{...}`)
// also ships palette, exif and more into every payload.
export function imageProjection(field: string, options: ImageProjectionOptions = {}): string {
  const assetFields = ['_id', 'url', 'metadata { dimensions, lqip }', ...(options.assetFields ?? [])];
  return `"${options.as ?? field}": ${field} { _type, alt, hotspot, crop, asset-> { ${assetFields.join(', ')} } }`;
}
