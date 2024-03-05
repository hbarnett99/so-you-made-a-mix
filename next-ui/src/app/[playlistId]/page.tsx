import { Table } from '@/components/ui/table';
import PlaylistCards from './playlist-cards';

const PlaylistAnalysis = async ({
  params,
}: {
  params: { playlistId: string };
}) => {
  console.log(params.playlistId);

  return (
    <div>
      <PlaylistCards />
    </div>
  );
};

export default PlaylistAnalysis;
