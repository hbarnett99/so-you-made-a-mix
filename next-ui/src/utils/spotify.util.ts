import { Playlist, SpotifyApi } from '@spotify/web-api-ts-sdk';

const sdk = SpotifyApi.withClientCredentials(
  process.env.SPOTIFY_CLIENT_ID!,
  process.env.SPOTIFY_CLIENT_SECRET!,
  ['playlist-read-private', 'playlist-read-collaborative'],
);

export const getSpotifyPlaylistById = async (playlistId: string): Promise<Playlist | undefined> => {
  try {
    return await sdk.playlists.getPlaylist(playlistId);
  } catch (error) {
    console.error(`Failed to fetch Spotify playlist ${playlistId}:`, error);
    return undefined;
  }
};