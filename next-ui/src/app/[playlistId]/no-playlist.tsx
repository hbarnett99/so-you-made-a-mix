'use client';

import { motion, useAnimation } from 'framer-motion';
import { FormEvent, useEffect } from 'react';
import { stagger, useAnimate } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronRight, Loader2, LoaderIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useBoolean } from 'usehooks-ts';

const words = `Couldn't find that mix.`;
const spotifyPlaylistUrl = 'https://open.spotify.com/playlist/';
const spotifyPlaylistIdLength = 22;

const NoPlaylist = ({ className }: { className?: string }) => {
  const [scope, animate] = useAnimate();
  const controls = useAnimation(); // Initialize animation controls

  let wordsArray = [words];

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

  const searchForPlaylist = async (e: FormEvent) => {
    e.preventDefault();

    await controls.start({
      y: -20,
      opacity: 0,
      transition: { duration: 0.4 },
    });

    const spotifyUrlOrId = scope.current.querySelector('input').value;
    nav.push(
      spotifyUrlOrId
        .replace(spotifyPlaylistUrl, '')
        .slice(0, spotifyPlaylistIdLength),
    );
  };

  return (
    <div className='flex items-center space-x-2 pr-2 h-[90%]'>
      <motion.div
        ref={scope}
        className='w-fit'
        animate={controls} // Pass the animation controls to the motion.div
      >
        <div className={cn('font-bold', className)}>
          <div className='mt-4 flex'>
            <div className='dark:text-white text-black sm:text-[5em] text-[3em] leading-snug tracking-wide'>
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

        <form onSubmit={(e) => searchForPlaylist(e)}>
          <motion.span className='opacity-0 mt-3 flex items-center space-x-2 sm:pr-2'>
            <Input placeholder='Spotify Playlist Link or ID' />
            <Button
              type='submit'
              size={'icon'}
            >
              <ChevronRight />
            </Button>
          </motion.span>
        </form>
      </motion.div>
    </div>
  );
};

export default NoPlaylist;
