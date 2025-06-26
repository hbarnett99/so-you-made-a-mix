import { getMatchStatistics } from "@/utils/track-matching.util";
import { Playlist } from "@spotify/web-api-ts-sdk";
import { TrackWithAudioFeatures } from "./spotify.types";
import { EnhancedTrack } from "./tidal.types";

export interface EnhancedPlaylist extends Omit<Playlist<TrackWithAudioFeatures>, 'tracks'> {
  tracks: {
    href: string;
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
    items: Array<{
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
      video_thumbnail: { url: string | null };
    }>;
  };
  tidalMatchStats?: ReturnType<typeof getMatchStatistics>;
}