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
import { useEffect } from 'react';
import PlaylistCardInternal, { Playlist } from './playlist-summary-internal';

const mockPlaylist = {
  images: [
    {
      url: 'https://mosaic.scdn.co/640/ab67616d00001e022719fc48324db1d94ac020abab67616d00001e0261836b2a874b9026de75a1c6ab67616d00001e0265c886cb0cad279a6d81a3afab67616d00001e02b745ab640223d633c92421f6',
      height: 640,
      width: 640,
    },
    {
      url: 'https://mosaic.scdn.co/300/ab67616d00001e022719fc48324db1d94ac020abab67616d00001e0261836b2a874b9026de75a1c6ab67616d00001e0265c886cb0cad279a6d81a3afab67616d00001e02b745ab640223d633c92421f6',
      height: 300,
      width: 300,
    },
    {
      url: 'https://mosaic.scdn.co/60/ab67616d00001e022719fc48324db1d94ac020abab67616d00001e0261836b2a874b9026de75a1c6ab67616d00001e0265c886cb0cad279a6d81a3afab67616d00001e02b745ab640223d633c92421f6',
      height: 60,
      width: 60,
    },
  ],
  name: 'Dubbed',
  owner: { display_name: 'Henry Barnett' },
};

const PlaylistSummary = async () => {

  const playlist_id = '6kgnKWae3wPZyTetaNjSVu';

  const playlist: any = (await fetch(
    `https://api.spotify.com/v1/playlists/${playlist_id}?fields=name,owner.display_name,images`,
    {
      cache: 'no-store',
    },
  )).status;

  return <PlaylistCardInternal playlist={playlist} />;
};

export default PlaylistSummary;
