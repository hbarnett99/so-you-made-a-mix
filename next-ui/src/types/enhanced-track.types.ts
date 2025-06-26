import { Track } from '@spotify/web-api-ts-sdk';
import { TidalTrack } from './tidal.types';

export interface EnhancedTrack {
  isrc: string | null;
  spotify: Track;
  tidal: TidalTrack | null;
  matchStatus: 'matched' | 'no_isrc' | 'not_found' | 'error';
}

export interface EnhancedPlaylistItem {
  added_at: string;
  added_by: {
    external_urls: { spotify: string };
    href: string;
    id: string;
    type: string;
    uri: string;
  };
  is_local: boolean;
  primary_color: string | null;
  track: EnhancedTrack;
}

export interface TidalMatchingStats {
  total: number;
  matched: number;
  noIsrc: number;
  notFound: number;
  errors: number;
  matchRate: number;
  isrcAvailabilityRate: number;
}