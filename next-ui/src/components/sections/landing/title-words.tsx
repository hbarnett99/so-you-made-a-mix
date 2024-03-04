'use client';

import { useEffect } from 'react';
import { motion, stagger, useAnimate } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const words = 'So, you made a mix.';
const spotifyPlaylistUrl = 'https://open.spotify.com/playlist/';
const spotifyPlaylistIdLength = 22;

const TitleWords = ({ className }: { className?: string }) => {
  const [scope, animate] = useAnimate();

  // let wordsArray = [words1, words2]
  let wordsArray = words.split(' ');

  useEffect(() => {
    animate(
      'span',
      {
        opacity: 1,
      },
      {
        duration: 4,
        delay: stagger(0.3),
      },
    );
  }, [scope.current]);

  const nav = useRouter();

  const searchForPlaylist = () => {
    const spotifyUrlOrId = scope.current.querySelector('input').value; // Assuming Input is a wrapper for a native input element
    nav.push(
      spotifyUrlOrId
        .replace(spotifyPlaylistUrl, '')
        .slice(0, spotifyPlaylistIdLength),
    );
  };

  return (
    <motion.div
      ref={scope}
      className='w-fit'
    >
      <div className={cn('font-bold', className)}>
        <div className='mt-4 flex'>
          <div className='dark:text-white text-black text-[7em] leading-snug tracking-wide'>
            {wordsArray.map((word, idx) => {
              return (
                <motion.span
                  key={word + idx}
                  className='dark:text-white text-black opacity-0'
                >
                  {word}{' '}
                </motion.span>
              );
            })}
          </div>
        </div>
      </div>

      <motion.span className='opacity-0 mt-3 flex items-center space-x-2 pr-2'>
        <Input placeholder='Spotify Playlist Link or ID' />
        <Button
          type='submit'
          size={'icon'}
          onClick={searchForPlaylist}
        >
          <ChevronRight />
        </Button>
      </motion.span>
    </motion.div>
  );
};

export default TitleWords;
