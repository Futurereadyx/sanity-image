import {
  createSanityImage,
  parseAssetUrl,
  type ImageUrlOptions,
  type SanityImageClient,
  type SanityImageConfig,
  type SanityImageSource,
} from '@frx/sanity-image';

export type SanityImageConfigInput = Partial<SanityImageConfig>;

const clients = new Map<string, SanityImageClient>();

// Literal `process.env.NEXT_PUBLIC_*` references are what Next inlines into client bundles.
function envConfig(): SanityImageConfigInput {
  return {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  };
}

export function resolveConfig(
  explicit: SanityImageConfigInput | undefined,
  source: SanityImageSource | null | undefined,
): SanityImageConfig | undefined {
  const env = envConfig();
  const fromUrl = parseAssetUrl(source?.asset?.url);
  const projectId = explicit?.projectId || env.projectId || fromUrl?.projectId;
  const dataset = explicit?.dataset || env.dataset || fromUrl?.dataset;
  if (!projectId || !dataset) return undefined;
  return { projectId, dataset, baseUrl: explicit?.baseUrl, quality: explicit?.quality };
}

export function getSanityImage(
  explicit?: SanityImageConfigInput,
  source?: SanityImageSource | null,
): SanityImageClient | undefined {
  const config = resolveConfig(explicit, source);
  if (!config) return undefined;
  const key = [config.projectId, config.dataset, config.baseUrl ?? '', config.quality ?? ''].join('|');
  let client = clients.get(key);
  if (!client) {
    client = createSanityImage(config);
    clients.set(key, client);
  }
  return client;
}

export function urlFor(source: SanityImageSource | null | undefined, options?: ImageUrlOptions) {
  return getSanityImage(undefined, source)?.urlFor(source, options);
}

export function imageUrl(source: SanityImageSource | null | undefined, options?: ImageUrlOptions) {
  return getSanityImage(undefined, source)?.imageUrl(source, options);
}

export const MISSING_CONFIG_MESSAGE =
  'No Sanity project config found. Set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET, pass projectId/dataset props, project asset->url in your query, or use createSanityImageComponent({ projectId, dataset }).';
