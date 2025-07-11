export interface DownloadJob {
  id: string;
  playlistId: string;
  playlistName: string;
  status: 'queued' | 'downloading' | 'zipping' | 'completed' | 'failed';
  progress: {
    current: number;
    total: number;
    currentTrack?: string;
  };
  downloadUrl?: string;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
  failedTracks: string[];
}

// Simple in-memory storage (fine for your low volume)
const jobs = new Map<string, DownloadJob>();

export const JobStorage = {
  create: (
    playlistId: string,
    playlistName: string,
    totalTracks: number,
  ): DownloadJob => {
    const id = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const job: DownloadJob = {
      id,
      playlistId,
      playlistName,
      status: 'queued',
      progress: { current: 0, total: totalTracks },
      createdAt: new Date(),
      failedTracks: [],
    };
    jobs.set(id, job);
    return job;
  },

  get: (jobId: string): DownloadJob | undefined => {
    return jobs.get(jobId);
  },

  update: (
    jobId: string,
    updates: Partial<DownloadJob>,
  ): DownloadJob | undefined => {
    const job = jobs.get(jobId);
    if (!job) return undefined;

    const updatedJob = { ...job, ...updates };
    jobs.set(jobId, updatedJob);
    return updatedJob;
  },

  delete: (jobId: string): boolean => {
    return jobs.delete(jobId);
  },

  // Cleanup old jobs (call this periodically)
  cleanup: (): void => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    for (const [id, job] of jobs.entries()) {
      if (job.createdAt < oneHourAgo) {
        jobs.delete(id);
      }
    }
  },
};
