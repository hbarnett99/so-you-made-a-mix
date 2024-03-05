import { Table } from '@/components/ui/table';
import PlaylistCards from './playlist-cards';

const PlaylistAnalysis = async ({
  params,
  searchParams,
}: {
  params: { playlistId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  console.log(params.playlistId);

  return (
    <div>
      <PlaylistCards />
    </div>
  );
};

export default PlaylistAnalysis;
