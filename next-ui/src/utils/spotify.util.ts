import { TrackWithAudioFeatures } from '@/types';
import { Playlist, SpotifyApi } from '@spotify/web-api-ts-sdk';

const sdk = SpotifyApi.withClientCredentials(
  process.env.SPOTIFY_CLIENT_ID!,
  process.env.SPOTIFY_CLIENT_SECRET!,
  ['playlist-read-private', 'playlist-read-collaborative'],
);

export const getSpotifyPlaylistById = async (playlistId: string) => {
  try {
    return await sdk.playlists.getPlaylist(playlistId);
  } catch {
    return undefined;
  }
};

export const getSpotifyTracksWithAudioFeatures = async (songIds: string[]) => {
  try {
    const audioFeatures = await sdk?.tracks?.audioFeatures(songIds);
    return audioFeatures
  } catch {
    return undefined;
  }
};

// After fetching your playlist tracks
export const getPlaylistWithAudioFeatures = async (
  playlistId: string,
): Promise<Playlist<TrackWithAudioFeatures> | undefined> => {
  const playlistData = await getSpotifyPlaylistById(playlistId);
  if (!playlistData) return undefined;

  const trackIds = playlistData.tracks.items
    .map((item) => item.track?.id)
    .filter((id): id is string => !!id);

  const audioFeatures = await getSpotifyTracksWithAudioFeatures(trackIds);

  // Map audio features to the correct track by id
  const audioFeaturesMap = new Map(
    (audioFeatures ?? []).map((af) => [af.id, af]),
  );

  const playlist: Playlist<TrackWithAudioFeatures> = {
    ...playlistData,
    tracks: {
      ...playlistData.tracks,
      items: playlistData.tracks.items.map((item) => {
        const track = item.track;
        if (!track) return item; // If there's no track, return the item as is

        const audioFeature = audioFeaturesMap.get(track.id);
        return {
          ...item,
          track: {
            ...track,
            audioFeatures: audioFeature,
          } as TrackWithAudioFeatures,
        };
      }),
    },
  };

  return playlist;
};

// export const getSpotifyTrackById = async (trackId: string) => {
//     try {
//         return await sdk.
//     }
// }
