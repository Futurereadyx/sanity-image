import type { SanityImageSource } from './types';

export function getPlaceholder(source: SanityImageSource | null | undefined): string | undefined {
  return source?.asset?.metadata?.lqip || undefined;
}
