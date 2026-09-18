import type { ImageProps as NextImageProps } from 'next/image';
import {
  getImageDimensions,
  getPlaceholder,
  type SanityImageClient as CoreClient,
  type SanityImageConfig,
  type SanityImageSource,
} from '@frx/sanity-image';
import { SanityImageClient } from './client-image';
import { getSanityImage, MISSING_CONFIG_MESSAGE } from './config';
import { withNaturalWidth } from './loader';

const MIN_BLUR_SIZE = 40;

export type SanityImageComponentConfig = Partial<SanityImageConfig> & {
  placeholder?: 'blur' | 'empty';
};

export type SanityImageProps = Omit<
  NextImageProps,
  'src' | 'loader' | 'width' | 'height' | 'placeholder' | 'blurDataURL'
> & {
  image?: SanityImageSource | null;
  src?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  projectId?: string;
  dataset?: string;
  placeholder?: NextImageProps['placeholder'];
  blurDataURL?: string;
};

type ResolvedImage = { src: string; width?: number; height?: number };

const isDev = process.env.NODE_ENV !== 'production';

function warn(message: string) {
  if (isDev) console.warn(`[SanityImage] ${message}`);
}

function resolveImage(core: CoreClient, props: SanityImageProps): ResolvedImage | undefined {
  const { image, src, width, height, aspectRatio, fill } = props;

  if (src) return { src, width, height };
  if (!image) return undefined;

  const natural = getImageDimensions(image);

  if (fill) {
    const url = core.imageUrl(image);
    return url ? { src: withNaturalWidth(url, natural?.width) } : undefined;
  }

  const ratio = aspectRatio ?? (width && height ? width / height : natural?.aspectRatio);
  const resolvedWidth = width ?? (height && ratio ? Math.round(height * ratio) : natural?.width);
  const resolvedHeight =
    height ?? (resolvedWidth && ratio ? Math.round(resolvedWidth / ratio) : natural?.height);

  if (!resolvedWidth || !resolvedHeight) {
    warn('Cannot size image: pass width/height, fill, or project asset->metadata.dimensions.');
    return undefined;
  }

  const url = core.imageUrl(image, { width: resolvedWidth, height: resolvedHeight });
  return url
    ? { src: withNaturalWidth(url, natural?.width), width: resolvedWidth, height: resolvedHeight }
    : undefined;
}

export function createSanityImageComponent(config: SanityImageComponentConfig = {}) {
  const { placeholder: defaultPlaceholder = 'blur', ...baseConfig } = config;

  function SanityImage(props: SanityImageProps) {
    const {
      image,
      src: _src,
      width: _width,
      height: _height,
      aspectRatio: _aspectRatio,
      projectId,
      dataset,
      fill,
      sizes,
      quality,
      placeholder,
      blurDataURL,
      ...rest
    } = props;

    if (!image && !props.src) return null;

    const core = getSanityImage(
      { ...baseConfig, projectId: projectId ?? baseConfig.projectId, dataset: dataset ?? baseConfig.dataset },
      image,
    );
    if (!core) {
      if (isDev) throw new Error(`[SanityImage] ${MISSING_CONFIG_MESSAGE}`);
      return null;
    }

    const resolved = resolveImage(core, props);
    if (!resolved) return null;

    if (fill && !sizes) warn('`fill` without `sizes` makes Next assume 100vw; pass `sizes`.');

    const lqip = getPlaceholder(image);
    const bigEnough =
      fill || ((resolved.width ?? 0) >= MIN_BLUR_SIZE && (resolved.height ?? 0) >= MIN_BLUR_SIZE);
    const wantsBlur =
      placeholder === 'blur' || (!placeholder && defaultPlaceholder === 'blur' && lqip && bigEnough);
    const blur = wantsBlur ? (blurDataURL ?? lqip) : undefined;
    const resolvedPlaceholder = blur ? 'blur' : placeholder === 'blur' ? undefined : placeholder;

    return (
      <SanityImageClient
        {...rest}
        src={resolved.src}
        width={resolved.width}
        height={resolved.height}
        fill={fill}
        sizes={sizes}
        quality={quality ?? core.quality}
        placeholder={resolvedPlaceholder}
        blurDataURL={blur}
      />
    );
  }

  return SanityImage;
}

export const SanityImage = createSanityImageComponent();
