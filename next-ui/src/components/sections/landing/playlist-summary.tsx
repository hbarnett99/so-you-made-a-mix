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
