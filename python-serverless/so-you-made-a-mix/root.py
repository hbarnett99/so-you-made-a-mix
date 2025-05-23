

import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

# Set up your Spotify API credentials
CLIENT_ID = 'your_client_id'
CLIENT_SECRET = 'your_client_secret'

# Authenticate with Spotify API
client_credentials_manager = SpotifyClientCredentials(client_id=CLIENT_ID, client_secret=CLIENT_SECRET)
sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)

# Function to get playlist tracks
def get_playlist_tracks(playlist_id):
    playlist = sp.playlist(playlist_id)
    tracks = playlist['tracks']
    
    while tracks['next']:
        tracks = sp.next(tracks)
        for item in tracks['items']:
            track = item['track']
            print(f"Track: {track['name']} - Artist: {', '.join([artist['name'] for artist in track['artists']])}")
            print(f"Album: {track['album']['name']} - Release Date: {track['album']['release_date']}")
            print(f"Duration: {track['duration_ms'] // 1000} seconds")
            print("---")

# Example usage
playlist_id = 'your_playlist_id'
get_playlist_tracks(playlist_id)