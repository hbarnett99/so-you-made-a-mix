import { NextRequest, NextResponse } from 'next/server';
import { getEnhancedPlaylistWithTidal } from '@/utils/enhanced-playlist.util';
import { JobStorage } from '@/utils/job-storage.util';

export async function POST(request: NextRequest) {
  try {
    const { playlistId } = await request.json();

    if (!playlistId) {
      return NextResponse.json(
        { error: 'Playlist ID is required' },
        { status: 400 },
      );
    }

    // Get playlist info to validate and get track count
    const enhancedPlaylist = await getEnhancedPlaylistWithTidal(playlistId);

    if (!enhancedPlaylist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 },
      );
    }

    // Only count tracks that have TIDAL matches
    const downloadableTracks = enhancedPlaylist.tracks.items.filter(
      (item) => item.track.matchStatus === 'matched',
    );

    if (downloadableTracks.length === 0) {
      return NextResponse.json(
        { error: 'No downloadable tracks found in playlist' },
        { status: 400 },
      );
    }

    // Create job
    const job = JobStorage.create(
      playlistId,
      enhancedPlaylist.name,
      downloadableTracks.length,
    );

    // Start the download process asynchronously
    startDownloadProcess(job.id);

    return NextResponse.json({
      jobId: job.id,
      message: 'Download started',
      totalTracks: downloadableTracks.length,
    });
  } catch (error) {
    console.error('Failed to start download:', error);
    return NextResponse.json(
      { error: 'Failed to start download' },
      { status: 500 },
    );
  }
}

async function startDownloadProcess(jobId: string) {
  try {
    // Update job status
    JobStorage.update(jobId, { status: 'downloading' });

    // Call Python function (we'll implement this next)
    const response = await fetch(
      `${process.env.VERCEL_URL}/api/python/download-playlist`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      },
    );

    if (!response.ok) {
      throw new Error(`Python function failed: ${response.status}`);
    }
  } catch (error) {
    console.error(`Download job ${jobId} failed:`, error);
    JobStorage.update(jobId, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
