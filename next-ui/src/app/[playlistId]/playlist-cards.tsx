'use client';

import { Card } from '@/components/ui/card';
import { Song as Track } from '@/lib/types';
import { motion, stagger, useAnimate } from 'framer-motion';
import { useEffect } from 'react';

const demoTrack: Track = {
  albumArt:
    'https://i1.sndcdn.com/artworks-H2CieysXXAbRfa9E-yKpvxg-t500x500.jpg',
  name: 'Dark Silence - Mass Digital Remix',
  artists: ['Nursultan Kun', 'Mass Digital'],
  duration: 448,
  releaseDate: '2022-03-18',
  bpm: 120,
  key: 'Eb Minor',
  genre: 'Organic House / Downtempo',
  label: 'Everything Will Be OK',
  beatportLink: 'https://www.beatport.com/en/track/dark-silence/16272615',
  spotifyLink:
    'https://open.spotify.com/track/1ldBZfCHwqWhtgcgSXkgZQ?si=c97064afd8c74644',
};

const myArr = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

const DemoCard = () => (
  <Card className='p-4 hover:bg-accent transition duration-300 border rounded-lg'>
    <div className='flex justify-between'>
      <div>
        <p className='text-lg font-semibold'>William Smith</p>
        <p className='text-sm text-gray-400'>Meeting Tomorrow</p>
        <p className='text-sm mt-2'>
          Hi, let's have a meeting tomorrow to discuss the project. I've been
          reviewing the project details and have some ideas I'd like to share.
          It's crucial that we align on our...
        </p>
      </div>
      <p className='text-sm text-gray-400'>4 months ago</p>
    </div>
  </Card>
);

const PlaylistCard = ({ track }: { track: Track }) => (
  <motion.div className='opacity-0'>
    <Card className='p-4 hover:bg-accent transition duration-300 border rounded-lg'>
      <div className='grid grid-cols-8 auto-cols-auto space-x-4 h-full'>
        <div className='flex space-x-4 col-span-3'>
          <img
            src={track.albumArt}
            alt={`${track.name}, by ${track.artists.join(', ')} - album art`}
            className='rounded-md h-24'
          />
          <span className='self-center'>
            <p className='text-lg font-semibold'>{track.name}</p>
            <p className='text-sm text-gray-400'>{`${track.artists.join(', ')}`}</p>
          </span>
        </div>
      </div>
    </Card>
  </motion.div>
);

const PlaylistCards = () => {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    animate(
      'div',
      {
        opacity: 1,
      },
      {
        duration: 1,
        delay: stagger(0.05),
      },
    );
  }, [scope.current]);

  return (
    <motion.div
      ref={scope}
      className='space-y-2 overflow-auto lg:pb-24 md:pb-16 pb-8'
    >
      {myArr.map((v, i) => (
        <PlaylistCard
          track={demoTrack}
          key={i}
        />
      ))}
    </motion.div>
  );
};

export default PlaylistCards;
