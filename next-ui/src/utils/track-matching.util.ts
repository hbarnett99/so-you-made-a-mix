import { Track } from '@spotify/web-api-ts-sdk';
import { searchTidalByISRC, searchTidalByMultipleISRC } from '@/utils/tidal.util';
import { EnhancedTrack, TidalMatchingStats } from '@/types/enhanced-track.types';

/**
 * Match a single Spotify track to TIDAL using ISRC
 */
export async function matchSpotifyTrackToTidal(spotifyTrack: Track): Promise<EnhancedTrack> {
    const isrc = spotifyTrack.external_ids?.isrc || null;

    const baseTrack: EnhancedTrack = {
        isrc,
        spotify: spotifyTrack,
        tidal: null,
        matchStatus: 'no_isrc',
    };

    // No ISRC available
    if (!isrc) {
        console.log(`No ISRC available for track: ${spotifyTrack.name} by ${spotifyTrack.artists.map(a => a.name).join(', ')}`);
        return baseTrack;
    }

    try {
        const tidalTrack = await searchTidalByISRC(isrc);

        if (!tidalTrack) {
            return {
                ...baseTrack,
                matchStatus: 'not_found',
            };
        }

        return {
            ...baseTrack,
            tidal: tidalTrack,
            matchStatus: 'matched',
        };
    } catch (error) {
        console.error(`Failed to match track ${spotifyTrack.name} (ISRC: ${isrc}):`, error);
        return {
            ...baseTrack,
            matchStatus: 'error',
        };
    }
}

/**
 * Match multiple Spotify tracks to TIDAL with concurrency control
 */
/**
 * Match multiple Spotify tracks to TIDAL using batch ISRC search
 */
export async function matchSpotifyTracksToTidal(
  spotifyTracks: Track[],
  batchSize: number = 50
): Promise<EnhancedTrack[]> {
  console.log(`Starting TIDAL matching for ${spotifyTracks.length} tracks with batch size: ${batchSize}`);
  
  const results: EnhancedTrack[] = [];
  
  // Process tracks in batches
  for (let i = 0; i < spotifyTracks.length; i += batchSize) {
    const batch = spotifyTracks.slice(i, i + batchSize);
    
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(spotifyTracks.length / batchSize)}`);
    
    // Extract ISRCs from this batch
    const tracksWithISRC = batch
      .map((track, index) => ({ track, originalIndex: i + index, isrc: track.external_ids?.isrc }))
      .filter((item): item is { track: Track; originalIndex: number; isrc: string } => !!item.isrc);
    
    // Get TIDAL matches for all ISRCs in this batch
    const isrcs = tracksWithISRC.map(item => item.isrc);
    const tidalMatches = isrcs.length > 0 ? await searchTidalByMultipleISRC(isrcs) : new Map();
    
    // Process each track in the batch
    const batchResults = batch.map((spotifyTrack) => {
      const isrc = spotifyTrack.external_ids?.isrc || null;
      
      const baseTrack: EnhancedTrack = {
        isrc,
        spotify: spotifyTrack,
        tidal: null,
        matchStatus: 'no_isrc',
      };

      if (!isrc) {
        return baseTrack;
      }

      const tidalTrack = tidalMatches.get(isrc);
      
      if (!tidalTrack) {
        return {
          ...baseTrack,
          matchStatus: 'not_found' as const,
        };
      }

      return {
        ...baseTrack,
        tidal: tidalTrack,
        matchStatus: 'matched' as const,
      };
    });
    
    results.push(...batchResults);
    
    // Small delay between batches to be respectful to the API
    if (i + batchSize < spotifyTracks.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return results;
}

/**
 * Calculate match statistics for enhanced tracks
 */
export function calculateMatchingStats(enhancedTracks: EnhancedTrack[]): TidalMatchingStats {
    console.table(enhancedTracks, ['spotify.name', 'tidal.name', 'matchStatus', 'isrc']);
    const total = enhancedTracks.length;
    const matched = enhancedTracks.filter(t => t.matchStatus === 'matched').length;
    const noIsrc = enhancedTracks.filter(t => t.matchStatus === 'no_isrc').length;
    const notFound = enhancedTracks.filter(t => t.matchStatus === 'not_found').length;
    const errors = enhancedTracks.filter(t => t.matchStatus === 'error').length;

    const tracksWithIsrc = total - noIsrc;

    return {
        total,
        matched,
        noIsrc,
        notFound,
        errors,
        matchRate: total > 0 ? (matched / total) * 100 : 0,
        isrcAvailabilityRate: total > 0 ? (tracksWithIsrc / total) * 100 : 0,
    };
}