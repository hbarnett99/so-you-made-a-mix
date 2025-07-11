import { NextRequest, NextResponse } from 'next/server';
import { getEnhancedPlaylistWithTidal } from '@/utils/enhanced-playlist.util';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playlistId: string }> },
) {
  try {
    const { playlistId } = await params;

    const enhancedPlaylist = await getEnhancedPlaylistWithTidal(playlistId);

    if (!enhancedPlaylist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(enhancedPlaylist);
  } catch (error) {
    console.error('Failed to get playlist:', error);
    return NextResponse.json(
      { error: 'Failed to get playlist' },
      { status: 500 },
    );
  }
}
