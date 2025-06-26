import Loading from '@/components/ui/loading';
import NoPlaylist from './no-playlist';
import PlaylistCards from './playlist-cards';
import { motion } from 'framer-motion';
import { getSpotifyPlaylistById } from '@/utils/spotify.util';

const PlaylistAnalysis = async (
  props: {
    params: Promise<{ playlistId: string }>;
  }
) => {
  const params = await props.params;
  console.log(params.playlistId);

  const playlist = await getSpotifyPlaylistById(params.playlistId);

  return (
    <div className='h-full'>
      {!!playlist ? <PlaylistCards playlist={playlist} /> : <NoPlaylist />}
    </div>
  );
};

export default PlaylistAnalysis;
