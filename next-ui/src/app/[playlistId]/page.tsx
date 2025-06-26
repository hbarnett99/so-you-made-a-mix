import NoPlaylist from './no-playlist';
import PlaylistCards from './playlist-cards';
import { getEnhancedPlaylistWithTidal } from '@/utils/enhanced-playlist.util';

const PlaylistAnalysis = async (
  props: {
    params: Promise<{ playlistId: string }>;
  }
) => {
  const params = await props.params;
  console.log(`Loading playlist: ${params.playlistId}`);

  try {
    const enhancedPlaylist = await getEnhancedPlaylistWithTidal(params.playlistId);

    return (
      <div className='h-full'>
        {enhancedPlaylist ? (
          <PlaylistCards playlist={enhancedPlaylist} />
        ) : (
          <NoPlaylist />
        )}
      </div>
    );
  } catch (error) {
    console.error('Failed to load playlist:', error);
    return (
      <div className='h-full'>
        <NoPlaylist />
      </div>
    );
  }
};

export default PlaylistAnalysis;