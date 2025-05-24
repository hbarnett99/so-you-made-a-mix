'use client';

// Import necessary modules from framer-motion
import { motion, useAnimation } from 'framer-motion';
import { FormEvent, useEffect } from 'react';
import { stagger, useAnimate } from 'framer-motion';
import { cn } from '@/utils';
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
    const animateWords = async () => {
      const spans = scope.current.querySelectorAll('span');
      if (!spans.length) return;

      // Animate the first word
      await animate(spans[0], { opacity: 1 }, { duration: 0.4 });

      // Add a custom delay before the second word
      await new Promise((res) => setTimeout(res, 500));

      // Animate the second word
      if (spans[1]) {
        await animate(spans[1], { opacity: 1 }, { duration: 0.3 });
      }

      // Animate the rest without extra delay
      for (let i = 2; i < spans.length; i++) {
        await animate(spans[i], { opacity: 1 }, { duration: 0.3 });
      }
    };

    animateWords();
  }, [animate, scope]);

  const nav = useRouter();

  const searchForPlaylist = async (e: FormEvent) => {
    e.preventDefault();

    await controls.start({
      y: -20,
      opacity: 0,
      transition: {duration: .4},
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
