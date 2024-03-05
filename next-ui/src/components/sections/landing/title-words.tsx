'use client';

// Import necessary modules from framer-motion
import { motion, useAnimation } from 'framer-motion';
import { FormEvent, useEffect } from 'react';
import { stagger, useAnimate } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useBoolean } from 'usehooks-ts';

const words = 'So, you made a mix.';
const spotifyPlaylistUrl = 'https://open.spotify.com/playlist/';
const spotifyPlaylistIdLength = 22;

const TitleWords = ({ className }: { className?: string }) => {
  const [scope, animate] = useAnimate();
  const controls = useAnimation(); // Initialize animation controls

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

  const searchForPlaylist = async (e: FormEvent) => {
    e.preventDefault();

    // Animate the motion.div when the form is submitted
    await controls.start({
      y: -20, // Move up
      opacity: 0, // Fade out
      transition: {duration: .4}, // Set the duration to 0.8 seconds (adjust as needed)
    });

    const spotifyUrlOrId = scope.current.querySelector('input').value;
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
      animate={controls} // Pass the animation controls to the motion.div
    >
      <div className={cn('font-bold', className)}>
        <div className='mt-4 flex'>
          <div className='dark:text-white text-black sm:text-[7em] text-[5em] leading-snug tracking-wide'>
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
  );
};

export default TitleWords;
