
export interface ImageInfo {
  path: string;
  name: string;
  size: number;
  dimensions: {
    width: number;
    height: number;
  };
}

export interface DuplicatePair {
  original: ImageInfo;
  duplicate: ImageInfo;
}
