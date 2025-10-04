export interface UnsplashPhoto {
  id: string;
  alt_description?: string | null;
  urls: {
    thumb: string;
    small: string;
    regular: string;
    full: string
  };
  likes?: number;
  links?: {
    download?: string;
    html?: string
  };
  user?: {
    name?: string
  };
}

export interface PhotoPage {
  photos: UnsplashPhoto[];
  total: number;
  page: number;
  per_page: number;
}
