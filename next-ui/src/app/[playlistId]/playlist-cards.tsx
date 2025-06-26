'use client';

import { Card } from '@/components/ui/card';
import { TrackWithAudioFeatures } from '@/types/spotify.types';
import { searchBeatportBySpotifyTrack } from '@/utils/beatport.util';
import { Playlist, PlaylistedTrack, Track } from '@spotify/web-api-ts-sdk';
import { motion, stagger, useAnimate } from 'framer-motion';
import Image from 'next/image';
import { useEffect } from 'react';

const PlaylistCard = ({
  playlistedTrack,
}: {
  playlistedTrack: PlaylistedTrack<TrackWithAudioFeatures>;
}) => {
  const track = playlistedTrack.track;

  // console.log(track?.audioFeatures)

  return (
    <motion.div className='opacity-0'>
      <Card className='p-4 hover:bg-accent transition duration-300 border rounded-lg'>
        <div className='grid grid-cols-8 auto-cols-auto space-x-4 h-full'>
          <div className='flex space-x-4 col-span-3'>
            <Image
              src={
                !track.is_local
                  ? track.album.images[0]?.url
                  : '/no-album-art.png'
              }
              alt={`${track.name}, by ${track.artists.map((a) => a.name).join(', ')} - album art`}
              className={`rounded-md h-24 aspect-auto ${track.is_local ? 'invert' : ''}`}
              width={100}
              height={100}
            />
            <span className='self-center'>
              <p className='text-lg font-semibold'>{track.name}</p>
              <p className='text-sm text-gray-400'>{`${track.artists.map((a) => a.name).join(', ')}`}</p>
            </span>
          </div>
          <div>
            <span className='self-center'>
              
            </span>

          </div>
          <Image
            src='beatport.svg'
            alt={`Beatport Link for ${track.name}, by ${track.artists.map((a) => a.name).join(', ')}`}
            className='grayscale h-12 aspect-auto hover:grayscale-0 hover:h-14 cursor-pointer duration-300 justify-self-end self-center'
            onClick={() => searchBeatportBySpotifyTrack(track)}
            width={100}
            height={100}
          />
        </div>
      </Card>
    </motion.div>
  );
};

const PlaylistCards = ({
  playlist,
}: {
  playlist: Playlist<TrackWithAudioFeatures>;
}) => {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    animate(
      'div',
      {
        opacity: 1,
      },
      {
        duration: 1,
        delay: stagger(0.02),
      },
    );
  }, [scope.current]);

  return (
    <>
      <div>
        <Image
          src={playlist.images[0]?.url}
          className='rounded-lg aspect-square'
          alt={`${playlist.name} by ${playlist.owner} - Cover Image`}
          height={100}
          width={100}
        />
      </div>
      <motion.div
        ref={scope}
        className='space-y-2 overflow-auto lg:pb-24 md:pb-16 pb-8'
      >
        {playlist.tracks.items.map((track, i) => (
          <PlaylistCard
            playlistedTrack={track}
            key={i}
          />
        ))}
      </motion.div>
    </>
  );
};

export default PlaylistCards;
