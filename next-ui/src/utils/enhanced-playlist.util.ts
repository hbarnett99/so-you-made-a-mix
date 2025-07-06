import { Track } from "@spotify/web-api-ts-sdk";
import { getSpotifyPlaylistById } from "./spotify.util";
import { matchSpotifyTracksToTidal, calculateMatchingStats } from "./track-matching.util";
import { EnhancedPlaylist } from "@/types/enhanced-playlist.types";

/**
 * Get a Spotify playlist and enhance it with TIDAL track data
 */
export const getEnhancedPlaylistWithTidal = async (
  playlistId: string,
): Promise<EnhancedPlaylist | undefined> => {
  console.log(`Fetching enhanced playlist data for: ${playlistId}`);
  
  // Get the Spotify playlist
  const spotifyPlaylist = await getSpotifyPlaylistById(playlistId);
  if (!spotifyPlaylist) {
    console.log('Spotify playlist not found');
    return undefined;
  }

  console.log(`Found Spotify playlist: "${spotifyPlaylist.name}" with ${spotifyPlaylist.tracks.items.length} tracks`);

  // Extract valid Spotify tracks (filter out nulls, we are keeping locals)
  const spotifyTracks: Track[] = spotifyPlaylist.tracks.items
    .map((item) => item.track)
    .filter((track): track is Track => !!track);

  console.log(`Processing ${spotifyTracks.length} non-local tracks for TIDAL matching...`);
  
  // Match all tracks with TIDAL
  const enhancedTracks = await matchSpotifyTracksToTidal(spotifyTracks);
  
  // Calculate matching statistics
  const tidalMatchingStats = calculateMatchingStats(enhancedTracks);
  
  console.log('TIDAL matching complete:', {
    total: tidalMatchingStats.total,
    matched: tidalMatchingStats.matched,
    matchRate: `${tidalMatchingStats.matchRate.toFixed(1)}%`,
    isrcAvailability: `${tidalMatchingStats.isrcAvailabilityRate.toFixed(1)}%`,
    noIsrc: tidalMatchingStats.noIsrc,
    notFound: tidalMatchingStats.notFound,
    errors: tidalMatchingStats.errors,
  });

  // Build the enhanced playlist
  const enhancedPlaylist: EnhancedPlaylist = {
    ...spotifyPlaylist,
    tracks: {
      ...spotifyPlaylist.tracks,
      items: spotifyPlaylist.tracks.items.map((item) => {
        // Force item.track to be a Track (never an Episode)
        const track = item.track as Track;

        if (!track || track.is_local) {
          return {
            ...item,
            track: {
              isrc: null,
              spotify: track,
              tidal: null,
              matchStatus: 'no_isrc' as const,
            },
          };
        }

        // Find the corresponding enhanced track
        const enhancedTrack = enhancedTracks.find(et => et.spotify.id === track.id);

        if (!enhancedTrack) {
          console.warn(`Could not find enhanced track for ${track.name}`);
          return {
            ...item,
            track: {
              isrc: track.external_ids?.isrc || null,
              spotify: track,
              tidal: null,
              matchStatus: 'error' as const,
            },
          };
        }

        return {
          ...item,
          track: enhancedTrack,
        };
      }),
    },
    tidalMatchingStats,
  };

  return enhancedPlaylist;
};