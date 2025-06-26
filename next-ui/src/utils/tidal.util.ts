import { TidalAuthResponse, TidalTrack, TidalError, TidalSearchResponse } from "@/types/tidal.types";

const tidalAuthUrl = process.env.TIDAL_AUTH_URL;
const tidalBaseUrl = process.env.TIDAL_API_BASE;

// Cache for access token
let cachedToken: { token: string; expires: number } | null = null;

/**
 * Get TIDAL access token using client credentials
 */
async function getTidalAccessToken(): Promise<string> {
  // Return cached token if still valid (with 5 minute buffer)
  if (cachedToken && cachedToken.expires > Date.now() + 5 * 60 * 1000) {
    return cachedToken.token;
  }

  const clientId = process.env.TIDAL_CLIENT_ID;
  const clientSecret = process.env.TIDAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('TIDAL_CLIENT_ID and TIDAL_CLIENT_SECRET must be set');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const response = await fetch(tidalAuthUrl!, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TIDAL auth failed: ${response.status} ${errorText}`);
    }

    const data: TidalAuthResponse = await response.json();
    
    // Cache the token
    cachedToken = {
      token: data.access_token,
      expires: Date.now() + (data.expires_in * 1000),
    };

    return data.access_token;
  } catch (error) {
    console.error('Failed to get TIDAL access token:', error);
    throw error;
  }
}

/**
 * Search TIDAL by ISRC
 */
export async function searchTidalByISRC(isrc: string): Promise<TidalTrack | null> {
  try {
    const token = await getTidalAccessToken();
    
    const response = await fetch(
      `${tidalBaseUrl}/v2/searchresults/tracks?query=isrc:${encodeURIComponent(isrc)}&limit=1&countryCode=US`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.tidal.v1+json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null; // No track found
      }
      const errorData: TidalError = await response.json();
      throw new Error(`TIDAL ISRC search failed: ${errorData.userMessage}`);
    }

    const data: TidalSearchResponse = await response.json();
    
    return data.tracks.items[0] || null;
  } catch (error) {
    console.error(`Failed to search TIDAL by ISRC ${isrc}:`, error);
    return null;
  }
}

/**
 * Get TIDAL track by ID
 */
export async function getTidalTrackById(trackId: string): Promise<TidalTrack | null> {
  try {
    const token = await getTidalAccessToken();
    
    const response = await fetch(
      `${tidalBaseUrl}/v2/tracks/${trackId}?countryCode=US`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.tidal.v1+json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const errorData: TidalError = await response.json();
      throw new Error(`TIDAL track fetch failed: ${errorData.userMessage}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to get TIDAL track ${trackId}:`, error);
    return null;
  }
}