import { EnhancedPlaylist } from "@/types/enhanced-playlist.types";
import { TrackWithAudioFeatures } from "@/types/spotify.types";
import { EnhancedTrack } from "@/types/tidal.types";
import { Playlist, Track } from "@spotify/web-api-ts-sdk";
import { getSpotifyPlaylistById } from "./spotify.util";
import { matchSpotifyTracksToTidal, getMatchStatistics } from "./track-matching.util";

// Original function for backward compatibility
export const getPlaylistWithAudioFeatures = async (
  playlistId: string,
): Promise<Playlist<TrackWithAudioFeatures> | undefined> => {
  const playlistData = await getSpotifyPlaylistById(playlistId);
  if (!playlistData) return undefined;

  const trackIds = playlistData.tracks.items
    .map((item) => item.track?.id)
    .filter((id): id is string => !!id);

  const audioFeatures = await getSpotifyTracksWithAudioFeatures(trackIds);

  // Map audio features to the correct track by id
  const audioFeaturesMap = new Map(
    (audioFeatures ?? []).map((af) => [af.id, af]),
  );

  const playlist: Playlist<TrackWithAudioFeatures> = {
    ...playlistData,
    tracks: {
      ...playlistData.tracks,
      items: playlistData.tracks.items.map((item) => {
        const track = item.track;
        if (!track) return item; // If there's no track, return the item as is

        const audioFeature = audioFeaturesMap.get(track.id);
        return {
          ...item,
          track: {
            ...track,
            audioFeatures: audioFeature,
          } as TrackWithAudioFeatures,
        };
      }),
    },
  };

  return playlist;
};

// New enhanced function that includes TIDAL data
export const getEnhancedPlaylistWithTidal = async (
  playlistId: string,
): Promise<EnhancedPlaylist | undefined> => {
  console.log(`Fetching enhanced playlist data for: ${playlistId}`);
  
  const playlistData = await getSpotifyPlaylistById(playlistId);
  if (!playlistData) {
    console.log('Playlist not found');
    return undefined;
  }

  console.log(`Found playlist: ${playlistData.name} with ${playlistData.tracks.items.length} tracks`);

  // Get audio features for Spotify tracks
  const trackIds = playlistData.tracks.items
    .map((item) => item.track?.id)
    .filter((id): id is string => !!id);

  const audioFeatures = await getSpotifyTracksWithAudioFeatures(trackIds);
  const audioFeaturesMap = new Map(
    (audioFeatures ?? []).map((af) => [af.id, af]),
  );

  // Extract Spotify tracks for TIDAL matching
  const spotifyTracks: Track[] = playlistData.tracks.items
    .map((item) => item.track)
    .filter((track): track is Track => !!track);

  console.log('Matching tracks with TIDAL...');
  
  // Match with TIDAL (this will take a moment)
  const enhancedTracks = await matchSpotifyTracksToTidal(spotifyTracks);
  
  // Get matching statistics
  const tidalMatchStats = getMatchStatistics(enhancedTracks);
  
  console.log('TIDAL matching complete:', {
    total: tidalMatchStats.total,
    matched: tidalMatchStats.matched,
    matchRate: `${tidalMatchStats.matchRate.toFixed(1)}%`,
    tracksWithISRC: tidalMatchStats.tracksWithISRC,
    isrcMatchRate: `${tidalMatchStats.isrcMatchRate.toFixed(1)}%`
  });

  // Build enhanced playlist
  const enhancedPlaylist: EnhancedPlaylist = {
    ...playlistData,
    tracks: {
      ...playlistData.tracks,
      items: playlistData.tracks.items.map((item, index) => {
        const track = item.track;
        if (!track) return { ...item, track: enhancedTracks[index] };

        const audioFeature = audioFeaturesMap.get(track.id);
        const enhancedTrack = enhancedTracks[index];

        // Merge audio features into the enhanced track
        const finalTrack: EnhancedTrack = {
          ...enhancedTrack,
          spotify: {
            ...enhancedTrack.spotify,
            // Add audio features if available
            ...(audioFeature && { audioFeatures: audioFeature }),
          } as any, // Type assertion needed due to audio features extension
        };

        return {
          ...item,
          track: finalTrack,
        };
      }),
    },
    tidalMatchStats,
  };

  return enhancedPlaylist;
};

// Helper function to get just the TIDAL data for existing playlists
export const enhancePlaylistWithTidal = async (
  playlist: Playlist<TrackWithAudioFeatures>
): Promise<EnhancedPlaylist> => {
  console.log(`Enhancing existing playlist with TIDAL data: ${playlist.name}`);

  // Extract Spotify tracks for TIDAL matching
  const spotifyTracks: Track[] = playlist.tracks.items
    .map((item) => item.track)
    .filter((track): track is Track => !!track);

  console.log('Matching tracks with TIDAL...');
  
  // Match with TIDAL
  const enhancedTracks = await matchSpotifyTracksToTidal(spotifyTracks);
  
  // Get matching statistics
  const tidalMatchStats = getMatchStatistics(enhancedTracks);
  
  console.log('TIDAL matching complete:', {
    total: tidalMatchStats.total,
    matched: tidalMatchStats.matched,
    matchRate: `${tidalMatchStats.matchRate.toFixed(1)}%`,
  });

  // Build enhanced playlist
  const enhancedPlaylist: EnhancedPlaylist = {
    ...playlist,
    tracks: {
      ...playlist.tracks,
      items: playlist.tracks.items.map((item, index) => {
        const enhancedTrack = enhancedTracks[index];
        
        return {
          ...item,
          track: enhancedTrack,
        };
      }),
    },
    tidalMatchStats,
  };

  return enhancedPlaylist;
};

function getSpotifyTracksWithAudioFeatures(trackIds: string[]) {
    throw new Error("Function not implemented.");
}
