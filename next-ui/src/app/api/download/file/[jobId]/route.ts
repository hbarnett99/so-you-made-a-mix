import { NextRequest, NextResponse } from 'next/server';
import { createReadStream, unlink, stat } from 'fs';
import { promisify } from 'util';
import path from 'path';
import { JobStorage } from '@/utils/job-storage.util';

const unlinkAsync = promisify(unlink);
const statAsync = promisify(stat);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const { jobId } = await params;

    // Get job details for playlist name
    const job = JobStorage.get(jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Construct file path
    const filePath = path.join('/tmp', `${jobId}.zip`);

    // Check if file exists
    try {
      await statAsync(filePath);
    } catch (error) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Create readable stream
    const stream = createReadStream(filePath);

    // Clean filename for download
    const cleanPlaylistName = job.playlistName
      .replace(/[^a-zA-Z0-9\s-_]/g, '') // Remove special chars
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .substring(0, 100); // Limit length

    const filename = `${cleanPlaylistName}.zip`;

    // Convert Node.js stream to Web Stream
    const readableStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk) => {
          controller.enqueue(chunk);
        });

        stream.on('end', () => {
          controller.close();
          // Delete file after streaming
          unlinkAsync(filePath).catch(console.error);
        });

        stream.on('error', (error) => {
          controller.error(error);
          // Try to delete file even on error
          unlinkAsync(filePath).catch(console.error);
        });
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': (await statAsync(filePath)).size.toString(),
      },
    });
  } catch (error) {
    console.error('Failed to serve file:', error);
    return NextResponse.json(
      { error: 'Failed to serve file' },
      { status: 500 },
    );
  }
}
