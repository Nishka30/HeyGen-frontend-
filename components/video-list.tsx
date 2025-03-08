import React, { useState, useEffect } from 'react';
import { Video, RefreshCw } from 'lucide-react';
import { userRequest } from '@/lib/axiosInstance';

interface VideoItem {
  video_translate_id: string;
  title: string;
  status: string;
  url?: string;
  message?: string;
}

interface VideoListProps {
  type: 'translation' | 'avatar';  // Define allowed types
}

export function VideoList({ type }: VideoListProps) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchVideos = async () => {
    try {
      // Adjust endpoint based on type
      const endpoint = type === 'translation' ? '/api/heygen/videos' : '/api/heygen/avatar-videos';
      const response = await userRequest.get(endpoint);
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
  }, [type, videos]);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-sm flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-sm">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4 text-gray-200">
        {type === 'translation' ? 'Translated Videos' : 'Avatar Videos'}
      </h2>
      
      <div className="space-y-4">
        {videos.length === 0 ? (
          <div className="text-center py-8">
            <Video className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-400">No videos yet</p>
          </div>
        ) : (
          videos.map((video) => (
            <div
              key={video.video_translate_id}
              className="border border-gray-700 rounded-lg p-4"
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
    </div>
  );
}