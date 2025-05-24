import { Track } from '@spotify/web-api-ts-sdk';

export const searchBeatportBySpotifyTrack = (track: Track) => {
  const search =
    track.external_ids?.isrc ??
    `${track.name} - ${track.artists.map((a) => a.name).join(', ')}`;
  window.open(`https://www.beatport.com/search?q=${search}`, '_blank');
};
