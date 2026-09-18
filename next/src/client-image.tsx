'use client';

import NextImage, { type ImageProps as NextImageProps } from 'next/image';
import { sanityImageLoader } from './loader';

export type SanityImageClientProps = Omit<NextImageProps, 'loader'>;

export function SanityImageClient(props: SanityImageClientProps) {
  return <NextImage {...props} loader={sanityImageLoader} />;
}
