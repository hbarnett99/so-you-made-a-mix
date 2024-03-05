'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  InvisibleCard,
} from '@/components/ui/card';
import { Image } from '@nextui-org/image';
import { stagger, useAnimate } from 'framer-motion';
import { url } from 'inspector';
import { useEffect } from 'react';

export interface Playlist {
  images: {
    url: string;
    height: number;
    width: number;
  }[];
  name: string;
  owner: { display_name: string };
}

const PlaylistSummaryInternal = ({ playlist }: { playlist?: any }) => {
  const [scope1, animate1] = useAnimate();

//   useEffect(() => {
//     animate1(
//       'span',
//       {
//         opacity: 1,
//       },
//       {
//         duration: 4,
//         delay: stagger(0.3),
//       },
//     );
//   }, [scope1.current]);

useEffect(() => {console.log(playlist)}, [playlist])

  return (
    <Card className='w-fit border-0'>
      <CardContent className='grid grid-cols-1 gap-1'>
        {/* <Image
          src={playlist?.images[0].url}
          alt={`${playlist?.name} cover image`}
          isBlurred
          width={256}
        />
        <div className='text-lg'>
          {playlist?.name}
          <CardDescription>{playlist?.owner.display_name}</CardDescription>
        </div> */}
      </CardContent>
    </Card>
  );
};

export default PlaylistSummaryInternal;
