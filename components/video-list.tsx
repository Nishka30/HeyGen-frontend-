import React, { useState, useEffect } from 'react';
import { Video, RefreshCw } from 'lucide-react';
import { userRequest } from '@/lib/axiosInstance'; // Adjust the import path accordingly

interface VideoItem {
  video_translate_id: string;
  title: string;
  status: string;
  url?: string;
  message?: string;
}

export function VideoList() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchVideos = async () => {
    try {
      const response = await userRequest.get('/api/heygen/videos');
      setVideos(response.data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load videos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
    // Poll for updates every 10 seconds for videos that are still processing
    const interval = setInterval(() => {
      const hasProcessingVideos = videos.some(video => 
        video.status === 'running' || video.status === 'pending'
      );
      if (hasProcessingVideos) {
        fetchVideos();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [videos]);

  if (isLoading) {
    return (
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-sm flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {videos.length === 0 ? (
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-sm text-center">
          <Video className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-400">No videos uploaded yet</p>
        </div>
      ) : (
        videos.map((video) => (
          <div
            key={video.video_translate_id}
            className="rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-sm"
          >
            <div className="flex items-center mb-4">
              <Video className="mr-2 h-5 w-5 text-gray-300" />
              <h3 className="font-medium text-gray-200">{video.title}</h3>
            </div>
            <div className="text-sm text-gray-400 mb-4">
              Status: {video.status}
            </div>
            
            {video.status === 'running' && (
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 animate-pulse rounded-full" style={{ width: '100%' }} />
              </div>
            )}

            {video.status === 'success' && video.url && (
              <video
                src={video.url}
                controls
                className="w-full rounded-lg border border-gray-700"
              />
            )}

            {video.status === 'failed' && video.message && (
              <p className="text-red-400 text-sm">{video.message}</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}