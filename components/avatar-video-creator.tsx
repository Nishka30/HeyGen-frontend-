import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserSquare2, Loader2, Mic, User, Crown } from 'lucide-react';
import { userRequest } from '@/lib/axiosInstance';

interface Avatar {
  avatar_id: string;
  avatar_name: string;
  gender: string;
  preview_image_url: string;
  preview_video_url: string;
  premium: boolean;
  type: string | null;
  tags: string[] | null;
}

interface Voice {
  voice_id: string;
  name: string;
  language: string;
  preview_audio: string;
  gender: string;
  emotion_support: boolean;
  support_pause: boolean;
  support_interactive_avatar: boolean;
}

interface VideoStatus {
  status: string;
  video_url?: string;
  error?: string;
}

interface VideoResponse {
  error: null | string;
  data: {
    video_id: string;
  };
  message: string;
}

const formSchema = z.object({
  avatar_pose_id: z.string().min(1, 'Avatar pose is required'),
  input_text: z.string().min(1, 'Script is required'),
  voice_id: z.string().min(1, 'Voice is required'),
  title: z.string().min(1, 'Title is required'),
});

export function AvatarVideoCreator() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState<VideoStatus | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      avatar_pose_id: '',
      input_text: '',
      voice_id: '',
      title: '',
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [avatarsRes, voicesRes] = await Promise.all([
          userRequest.get('/api/heygen/avatars'),
          userRequest.get('/api/heygen/voices')
        ]);

        setAvatars(avatarsRes.data.data.avatars || []);
        setVoices(voicesRes.data.data.voices || []);
      } catch (err) {
        setError('Failed to load avatars and voices');
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const voiceId = form.watch('voice_id');
    const voice = voices.find(v => v.voice_id === voiceId);
    setSelectedVoice(voice || null);
  }, [form.watch('voice_id'), voices]);

  useEffect(() => {
    const avatarId = form.watch('avatar_pose_id');
    const avatar = avatars.find(a => a.avatar_id === avatarId);
    setSelectedAvatar(avatar || null);
  }, [form.watch('avatar_pose_id'), avatars]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const checkVideoStatus = async () => {
      if (!videoId) return;

      try {
        const response = await userRequest.get(`/api/heygen/videos/${videoId}`);
        const status = response.data.data;

        setVideoStatus({
          status: status.status,
          video_url: status.video_url,
          error: status.error
        });

        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(intervalId);
        }
      } catch (err) {
        console.error('Error checking video status:', err);
      }
    };

    if (videoId) {
      checkVideoStatus();
      intervalId = setInterval(checkVideoStatus, 5000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [videoId]);

  const playVoicePreview = (previewUrl: string) => {
    const audio = new Audio(previewUrl);
    audio.play();
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');
      setVideoId(null);
      setVideoStatus(null);
      
      const response = await userRequest.post<VideoResponse>('/api/heygen/avatar-videos', {
        ...values,
        dimension: { width: 1280, height: 720 },
        avatar_style: 'normal'
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      if (response.data.data?.video_id) {
        setVideoId(response.data.data.video_id);
        setSuccessMessage(response.data.message || 'Video creation started successfully');
        form.reset();
      } else {
        throw new Error('No video ID received');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create avatar video');
    } finally {
      setIsLoading(false);
    }
  };

  const renderVideoStatus = () => {
    if (!videoStatus) return null;

    switch (videoStatus.status) {
      case 'processing':
        return (
          <div className="mt-4 p-4 bg-blue-900/50 text-blue-200 rounded-md border border-blue-700">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Processing video...</span>
            </div>
          </div>
        );
      case 'completed':
        return (
          <div className="mt-4 p-4 bg-green-900/50 text-green-200 rounded-md border border-green-700">
            <p className="mb-2">Video completed!</p>
            {videoStatus.video_url && (
              <a
                href={videoStatus.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                View Video
              </a>
            )}
          </div>
        );
      case 'failed':
        return (
          <div className="mt-4 p-4 bg-red-900/50 text-red-200 rounded-md border border-red-700">
            <p>Video generation failed</p>
            {videoStatus.error && <p className="mt-2 text-sm">{videoStatus.error}</p>}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <UserSquare2 className="h-8 w-8 text-blue-400" />
        <h2 className="text-2xl font-bold text-gray-200">Create Avatar Video</h2>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900/50 text-red-400 rounded-md border border-red-700">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-900/50 text-green-400 rounded-md border border-green-700">
          {successMessage}
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">
            Title
          </label>
          <input
            type="text"
            {...form.register('title')}
            placeholder="Enter video title"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200 placeholder-gray-400"
          />
          {form.formState.errors.title && (
            <p className="mt-1 text-sm text-red-400">
              {form.formState.errors.title.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">
            Script
          </label>
          <textarea
            {...form.register('input_text')}
            rows={4}
            placeholder="Enter the script for the avatar to speak"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200 placeholder-gray-400"
          />
          {form.formState.errors.input_text && (
            <p className="mt-1 text-sm text-red-400">
              {form.formState.errors.input_text.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300 flex items-center gap-2">
            <User className="h-4 w-4" />
            Avatar
          </label>
          <select
            {...form.register('avatar_pose_id')}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200"
          >
            <option value="" className="bg-gray-700">Select avatar</option>
            {avatars.map((avatar) => (
              <option
                key={avatar.avatar_id}
                value={avatar.avatar_id}
                className="bg-gray-700"
              >
                {`${avatar.avatar_name} (${avatar.gender})`}
              </option>
            ))}
          </select>
          {selectedAvatar && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                {selectedAvatar.premium && (
                  <span className="text-xs text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    Premium
                  </span>
                )}
              </div>
              <div className="aspect-video w-full max-w-sm rounded-lg overflow-hidden">
                <img
                  src={selectedAvatar.preview_image_url}
                  alt={selectedAvatar.avatar_name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
          {form.formState.errors.avatar_pose_id && (
            <p className="mt-1 text-sm text-red-400">
              {form.formState.errors.avatar_pose_id.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300 flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Voice
          </label>
          <select
            {...form.register('voice_id')}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200"
          >
            <option value="" className="bg-gray-700">Select voice</option>
            {voices.map((voice) => (
              <option
                key={voice.voice_id}
                value={voice.voice_id}
                className="bg-gray-700"
              >
                {`${voice.name} (${voice.language}, ${voice.gender})`}
              </option>
            ))}
          </select>
          {selectedVoice && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => playVoicePreview(selectedVoice.preview_audio)}
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <Mic className="h-4 w-4" />
                Preview Voice
              </button>
              {selectedVoice.emotion_support && (
                <span className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded">
                  Emotion Support
                </span>
              )}
              {selectedVoice.support_interactive_avatar && (
                <span className="text-xs text-purple-400 bg-purple-900/30 px-2 py-1 rounded">
                  Interactive Avatar
                </span>
              )}
            </div>
          )}
          {form.formState.errors.voice_id && (
            <p className="mt-1 text-sm text-red-400">
              {form.formState.errors.voice_id.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Creating...</span>
            </>
          ) : (
            <>
              <UserSquare2 className="h-5 w-5" />
              <span>Create Avatar Video</span>
            </>
          )}
        </button>
      </form>

      {renderVideoStatus()}
    </div>
  );
}