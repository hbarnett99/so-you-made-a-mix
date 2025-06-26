import { Track } from '@spotify/web-api-ts-sdk';
import {
  searchTidalByISRC,
} from '@/utils/tidal.util';
import {
  TidalTrack,
  EnhancedTrack,
} from "@/types/tidal.types";

/**
 * Calculate match confidence for ISRC matches
 * ISRC matches are always high confidence since they're unique identifiers
 */
function calculateMatchConfidence(
  spotifyTrack: Track,
  tidalTrack: TidalTrack,
  matchMethod: 'isrc'
): EnhancedTrack['matchConfidence'] {
  // ISRC matches are always high confidence
  return 'high';
}

/**
 * Match a single Spotify track to TIDAL using ISRC only
 */
export async function matchSpotifyTrackToTidal(
  spotifyTrack: Track
): Promise<EnhancedTrack> {
  const baseEnhancedTrack: EnhancedTrack = {
    spotify: {
      id: spotifyTrack.id,
      name: spotifyTrack.name,
      artists: spotifyTrack.artists.map(a => ({ name: a.name, id: a.id })),
      isrc: spotifyTrack.external_ids?.isrc,
      duration_ms: spotifyTrack.duration_ms,
      explicit: spotifyTrack.explicit,
      popularity: spotifyTrack.popularity,
      preview_url: spotifyTrack.preview_url ?? undefined,
      external_urls: spotifyTrack.external_urls,
    },
    matchConfidence: 'none',
    matchMethod: 'none',
  };

  try {
    // Only match by ISRC if available
    if (!spotifyTrack.external_ids?.isrc) {
      console.log(`No ISRC available for track: ${spotifyTrack.name}`);
      return baseEnhancedTrack;
    }

    const tidalTrack = await searchTidalByISRC(spotifyTrack.external_ids.isrc);
    
    if (!tidalTrack) {
      console.log(`No TIDAL match found for ISRC: ${spotifyTrack.external_ids.isrc}`);
      return baseEnhancedTrack;
    }

    // ISRC match found - always high confidence
    const matchConfidence = calculateMatchConfidence(spotifyTrack, tidalTrack, 'isrc');
    
    return {
      ...baseEnhancedTrack,
      tidal: {
        id: tidalTrack.id,
        title: tidalTrack.title,
        artists: tidalTrack.artists,
        isrc: tidalTrack.isrc,
        duration: tidalTrack.duration,
        audioQuality: tidalTrack.audioQuality,
        audioModes: tidalTrack.audioModes,
        explicit: tidalTrack.explicit,
        popularity: tidalTrack.popularity,
        url: tidalTrack.url,
        album: {
          id: tidalTrack.album.id,
          title: tidalTrack.album.title,
          releaseDate: tidalTrack.album.releaseDate,
          imageCover: tidalTrack.album.imageCover,
        },
      },
      matchConfidence,
      matchMethod: 'isrc',
    };
  } catch (error) {
    console.error(`Failed to match track ${spotifyTrack.name} (ISRC: ${spotifyTrack.external_ids?.isrc}):`, error);
    return baseEnhancedTrack;
  }
}

/**
 * Match multiple Spotify tracks to TIDAL (with concurrency control)
 */
export async function matchSpotifyTracksToTidal(
  spotifyTracks: Track[],
  concurrency: number = 5
): Promise<EnhancedTrack[]> {
  const results: EnhancedTrack[] = [];
  
  // Process tracks in batches to avoid rate limiting
  for (let i = 0; i < spotifyTracks.length; i += concurrency) {
    const batch = spotifyTracks.slice(i, i + concurrency);
    
    const batchPromises = batch.map(track => matchSpotifyTrackToTidal(track));
    const batchResults = await Promise.all(batchPromises);
    
    results.push(...batchResults);
    
    // Small delay between batches to be nice to the API
    if (i + concurrency < spotifyTracks.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}

/**
 * Get match statistics for a set of enhanced tracks
 */
export function getMatchStatistics(enhancedTracks: EnhancedTrack[]) {
  const total = enhancedTracks.length;
  const matched = enhancedTracks.filter(t => t.tidal).length;
  const isrcMatches = enhancedTracks.filter(t => t.matchMethod === 'isrc').length;
  const tracksWithISRC = enhancedTracks.filter(t => t.spotify.isrc).length;
  
  const confidenceBreakdown = {
    high: enhancedTracks.filter(t => t.matchConfidence === 'high').length,
    medium: enhancedTracks.filter(t => t.matchConfidence === 'medium').length,
    low: enhancedTracks.filter(t => t.matchConfidence === 'low').length,
    none: enhancedTracks.filter(t => t.matchConfidence === 'none').length,
  };
  
  return {
    total,
    matched,
    unmatched: total - matched,
    matchRate: (matched / total) * 100,
    tracksWithISRC,
    isrcMatchRate: tracksWithISRC > 0 ? (isrcMatches / tracksWithISRC) * 100 : 0,
    methods: {
      isrc: isrcMatches,
    },
    confidence: confidenceBreakdown,
  };
}