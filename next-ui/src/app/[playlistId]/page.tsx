import Loading from '@/components/ui/loading';
import NoPlaylist from './no-playlist';
import PlaylistCards from './playlist-cards';
import { motion } from 'framer-motion';

const PlaylistAnalysis = async ({
  params,
}: {
  params: { playlistId: string };
}) => {
  console.log(params.playlistId);

  const loading = false;
  const doesExist = params.playlistId.length > 3;

  const whatToRender = () => {
    
  };

  return <div className='h-full'>{doesExist ? <PlaylistCards /> : <NoPlaylist />}</div>;
};

export default PlaylistAnalysis;
