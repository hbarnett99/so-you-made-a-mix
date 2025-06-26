// TIDAL API Response Types
export interface TidalAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface TidalTrack {
  id: string;
  title: string;
  version?: string;
  isrc: string;
  explicit: boolean;
  audioQuality: 'LOW' | 'HIGH' | 'LOSSLESS' | 'HI_RES' | 'HI_RES_LOSSLESS';
  audioModes: string[];
  mediaMetadata: {
    tags?: string[];
  };
  album: TidalAlbum;
  artists: TidalArtist[];
  duration: number; // in seconds
  replayGain: number;
  peak: number;
  allowStreaming: boolean;
  streamReady: boolean;
  streamStartDate: string;
  premiumStreamingOnly: boolean;
  trackNumber: number;
  volumeNumber: number;
  popularity: number;
  copyright: string;
  url: string;
  isAvailableInAtmos: boolean;
}

export interface TidalAlbum {
  id: string;
  title: string;
  imageCover: TidalImageCover[];
  videoCover?: TidalImageCover[];
  releaseDate: string;
  numberOfTracks: number;
  numberOfVideos: number;
  numberOfVolumes: number;
  duration: number;
  explicit: boolean;
  upc: string;
  popularity: number;
  audioQuality: 'LOW' | 'HIGH' | 'LOSSLESS' | 'HI_RES' | 'HI_RES_LOSSLESS';
  audioModes: string[];
  mediaMetadata: {
    tags?: string[];
  };
  artists: TidalArtist[];
  url: string;
  type: 'ALBUM' | 'SINGLE' | 'EP' | 'COMPILATION';
}

export interface TidalArtist {
  id: string;
  name: string;
  picture: TidalImageCover[];
  main: boolean;
  url: string;
}

export interface TidalImageCover {
  url: string;
  width: number;
  height: number;
}

export interface TidalSearchResponse {
  tracks: {
    items: TidalTrack[];
    totalNumberOfItems: number;
  };
  albums: {
    items: TidalAlbum[];
    totalNumberOfItems: number;
  };
  artists: {
    items: TidalArtist[];
    totalNumberOfItems: number;
  };
}

export interface TidalError {
  status: number;
  subStatus: number;
  userMessage: string;
  errors: Array<{
    category: string;
    code: string;
    detail: string;
  }>;
}

// Enhanced track type combining Spotify and TIDAL data
export interface EnhancedTrack {
  spotify: {
    id: string;
    name: string;
    artists: Array<{ name: string; id: string }>;
    isrc?: string;
    duration_ms: number;
    explicit: boolean;
    popularity: number;
    preview_url?: string;
    external_urls: {
      spotify: string;
    };
  };
  tidal?: {
    id: string;
    title: string;
    artists: TidalArtist[];
    isrc: string;
    duration: number;
    audioQuality: string;
    audioModes: string[];
    explicit: boolean;
    popularity: number;
    url: string;
    album: {
      id: string;
      title: string;
      releaseDate: string;
      imageCover: TidalImageCover[];
    };
  };
  matchConfidence: 'high' | 'medium' | 'low' | 'none';
  matchMethod: 'isrc' | 'none';
}