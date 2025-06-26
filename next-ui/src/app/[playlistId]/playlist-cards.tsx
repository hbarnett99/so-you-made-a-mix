'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedPlaylist } from '@/types/enhanced-playlist.types';
import { EnhancedPlaylistItem, EnhancedTrack } from '@/types/enhanced-track.types';
import { searchBeatportBySpotifyTrack } from '@/utils/beatport.util';
import { motion, stagger, useAnimate } from 'framer-motion';
import Image from 'next/image';
import { useEffect } from 'react';

const TrackCard = ({ enhancedTrack }: { enhancedTrack: EnhancedTrack }) => {
  const { spotify, tidal, matchStatus, isrc } = enhancedTrack;

  // Format duration
  const formatDuration = (durationMs: number) => {
    const totalSeconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get the best available image
  const getTrackImage = () => {
    if (tidal?.album.imageCover?.[0]?.url) {
      return tidal.album.imageCover[0].url;
    }
    if (spotify.album.images?.[0]?.url) {
      return spotify.album.images[0].url;
    }
    return '/no-album-art.png';
  };

  // Get match status badge
  const getMatchBadge = () => {
    switch (matchStatus) {
      case 'matched':
        return <Badge variant="default">TIDAL Match</Badge>;
      case 'not_found':
        return <Badge variant="outline">No TIDAL Match</Badge>;
      case 'no_isrc':
        return <Badge variant="secondary">No ISRC</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return null;
    }
  };

  return (
    <motion.div className='opacity-0'>
      <Card className='p-4 hover:bg-accent transition duration-300 border rounded-lg'>
        <div className='grid grid-cols-12 gap-4 items-center'>
          {/* Album Art & Track Info */}
          <div className='col-span-5 flex space-x-4'>
            <Image
              src={getTrackImage()}
              alt={`${spotify.name} album art`}
              className='rounded-md h-16 w-16 object-cover'
              width={64}
              height={64}
            />
            <div className='flex flex-col justify-center min-w-0'>
              <p className='text-lg font-semibold truncate'>{spotify.name}</p>
              <p className='text-sm text-muted-foreground truncate'>
                {spotify.artists.map((a) => a.name).join(', ')}
              </p>
              <p className='text-xs text-muted-foreground'>
                {spotify.album.name}
              </p>
            </div>
          </div>

          {/* Track Metadata */}
          <div className='col-span-4 space-y-1'>
            <div className='flex gap-2 mb-2'>
              {getMatchBadge()}
            </div>

            <div className='grid grid-cols-2 gap-2 text-sm'>
              <div>
                <span className='text-muted-foreground'>Duration:</span>
                <br />
                {formatDuration(spotify.duration_ms)}
              </div>

              {tidal && (
                <div>
                  <span className='text-muted-foreground'>Quality:</span>
                  <br />
                  {tidal.audioQuality}
                </div>
              )}

              {isrc && (
                <div className='col-span-2'>
                  <span className='text-muted-foreground'>ISRC:</span>
                  <br />
                  <code className='text-xs'>{isrc}</code>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className='col-span-3 flex items-center justify-end space-x-3'>
            {tidal && (
              <a
                href={tidal.url}
                target="_blank"
                rel="noopener noreferrer"
                className='text-blue-500 hover:text-blue-400 text-sm font-medium'
              >
                Open in TIDAL
              </a>
            )}

            <Image
              src='/beatport.svg'
              alt={`Search on Beatport`}
              className='grayscale h-8 w-8 hover:grayscale-0 cursor-pointer transition-all duration-300 hover:scale-110'
              onClick={() => searchBeatportBySpotifyTrack(spotify)}
              width={32}
              height={32}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const PlaylistCards = ({ playlist }: { playlist: EnhancedPlaylist }) => {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    animate(
      'div',
      { opacity: 1 },
      { duration: 1, delay: stagger(0.02) }
    );
  }, [animate]);

  const getStatColour = (stat: number, total: number, golfScoring = false) => {
    let score = stat / total * 100;
    score = golfScoring ? 100 - score : score;

    if (score > 85) return 'text-green-500';
    if (score > 50) return 'text-yellow-500';
    if (score > 35) return 'text-orange-500';
    if (score >= 0) return 'text-red-500';
  };

  // Add this helper function
  const formatPlaylistDuration = (items: EnhancedPlaylistItem[]) => {
    const totalMs = items.reduce((sum, item) => sum + item.track.spotify.duration_ms, 0);
    const totalMinutes = Math.floor(totalMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const { tidalMatchingStats } = playlist;

  return (
    <>
      {/* Playlist Header */}
      <div className="mb-6">
        <div className="flex items-start space-x-6">
          <Image
            src={playlist.images[0]?.url || '/no-album-art.png'}
            className='rounded-lg aspect-square object-cover'
            alt={`${playlist.name} cover`}
            height={200}
            width={200}
          />
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{playlist.name}</h1>
            <p className="text-xl text-muted-foreground mb-1">
              by {playlist.owner.display_name}
            </p>
            <p className="text-muted-foreground mb-4">
              {playlist.tracks.total} tracks • {formatPlaylistDuration(playlist.tracks.items)} {playlist.description && `• ${playlist.description}`}
            </p>

            {/* TIDAL Integration Stats */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">TIDAL Integration</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getStatColour(tidalMatchingStats.matched, playlist.tracks.items.filter(item => item.track.isrc).length)}`}>
                    {tidalMatchingStats.matched}
                  </div>
                  <div className="text-sm text-muted-foreground">Matched</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getStatColour(tidalMatchingStats.matchRate, playlist.tracks.items.filter(item => item.track.isrc).length)}`}>
                    {tidalMatchingStats.matchRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Match Rate</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getStatColour(tidalMatchingStats.noIsrc, playlist.tracks.total, true)}`}>
                    {tidalMatchingStats.noIsrc}
                  </div>
                  <div className="text-sm text-muted-foreground">No ISRC</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getStatColour(tidalMatchingStats.isrcAvailabilityRate, playlist.tracks.total)}`}>
                    {tidalMatchingStats.isrcAvailabilityRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">ISRC Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Track List */}
      <motion.div
        ref={scope}
        className='space-y-3 overflow-auto lg:pb-24 md:pb-16 pb-8'
      >
        {playlist.tracks.items.map((item, index) => (
          <TrackCard
            enhancedTrack={item.track}
            key={`${item.track.spotify.id}-${index}`}
          />
        ))}
      </motion.div>
    </>
  );
};

export default PlaylistCards;