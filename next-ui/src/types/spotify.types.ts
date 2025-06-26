import type {
  AudioFeatures,
  Track,
} from '@spotify/web-api-ts-sdk';

export interface TrackWithAudioFeatures extends Track {
  audioFeatures?: AudioFeatures;
}
