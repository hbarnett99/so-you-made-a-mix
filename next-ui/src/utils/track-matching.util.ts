import { Track } from '@spotify/web-api-ts-sdk';
import { searchTidalByISRC } from '@/utils/tidal.util';
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
export async function matchSpotifyTracksToTidal(
    spotifyTracks: Track[],
    concurrency: number = 5
): Promise<EnhancedTrack[]> {
    const results: EnhancedTrack[] = [];

    console.log(`Starting TIDAL matching for ${spotifyTracks.length} tracks with concurrency: ${concurrency}`);

    // Process tracks in batches to avoid rate limiting
    for (let i = 0; i < spotifyTracks.length; i += concurrency) {
        const batch = spotifyTracks.slice(i, i + concurrency);

        console.log(`Processing batch ${Math.floor(i / concurrency) + 1}/${Math.ceil(spotifyTracks.length / concurrency)}`);

        const batchPromises = batch.map(track => matchSpotifyTrackToTidal(track));
        const batchResults = await Promise.all(batchPromises);

        results.push(...batchResults);

        // Small delay between batches to be respectful to the API
        if (i + concurrency < spotifyTracks.length) {
            await new Promise(resolve => setTimeout(resolve, 200));
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