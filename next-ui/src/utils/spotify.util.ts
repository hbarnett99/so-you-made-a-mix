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