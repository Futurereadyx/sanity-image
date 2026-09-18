export type SanityImageDimensions = {
  width: number;
  height: number;
  aspectRatio: number;
};

export type SanityImageHotspot = {
  _type?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

export type SanityImageCrop = {
  _type?: string;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
};

export type SanityImageAssetSource = {
  _ref?: string | null;
  _id?: string | null;
  url?: string | null;
  metadata?: {
    dimensions?: Partial<SanityImageDimensions> | null;
    lqip?: string | null;
  } | null;
};

export type SanityImageSource = {
  asset?: SanityImageAssetSource | null;
  hotspot?: SanityImageHotspot | null;
  crop?: SanityImageCrop | null;
};

export type SanityImageConfig = {
  projectId: string;
  dataset: string;
  baseUrl?: string;
  quality?: number;
};

export type ImageFit = 'clip' | 'crop' | 'fill' | 'fillmax' | 'max' | 'min' | 'scale';

export type ImageFormat = 'jpg' | 'pjpg' | 'png' | 'webp';

export type ImageUrlOptions = {
  width?: number;
  height?: number;
  quality?: number;
  fit?: ImageFit;
  dpr?: number;
  format?: ImageFormat;
  clamp?: boolean;
};

export type ImageSize = {
  width?: number;
  height?: number;
};

export type AutoWidths = {
  maxWidth: number;
  step: number;
};

export type ImagePropsOptions = {
  width?: number;
  height?: number;
  aspectRatio?: number;
  sizes?: string;
  widths?: readonly number[] | AutoWidths;
  densities?: readonly number[];
  quality?: number;
};

export type ImageProps = {
  src: string;
  srcSet: string;
  sizes?: string;
  width: number;
  height: number;
  placeholder?: string;
};
