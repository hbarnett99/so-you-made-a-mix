import { Playlist } from "@spotify/web-api-ts-sdk";
import { EnhancedPlaylistItem, TidalMatchingStats } from "./enhanced-track.types";

export interface EnhancedPlaylist extends Omit<Playlist, 'tracks'> {
  tracks: {
    href: string;
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
    items: EnhancedPlaylistItem[];
  };
  tidalMatchingStats: TidalMatchingStats;
}