import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserSquare2, Loader2, Mic, User, Crown, Video, Play, Pause, Sparkles, FileVideo, Settings2 } from 'lucide-react';
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
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

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
    setIsPreviewPlaying(false);
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

  const toggleVideoPreview = () => {
    if (videoRef.current) {
      if (isPreviewPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPreviewPlaying(!isPreviewPlaying);
    }
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

  const renderVideoPreview = () => {
    if (!videoStatus?.video_url && !selectedAvatar?.preview_video_url) return null;

    const videoUrl = videoStatus?.video_url || selectedAvatar?.preview_video_url;
    const isGeneratedVideo = !!videoStatus?.video_url;

    return (
      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          controls={isGeneratedVideo}
          loop={!isGeneratedVideo}
          onEnded={() => setIsPreviewPlaying(false)}
        />
        {!isGeneratedVideo && (
          <button
            onClick={toggleVideoPreview}
            className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors group"
          >
            {isPreviewPlaying ? (
              <Pause className="h-16 w-16 text-white opacity-75 group-hover:opacity-100 transition-opacity" />
            ) : (
              <Play className="h-16 w-16 text-white opacity-75 group-hover:opacity-100 transition-opacity" />
            )}
          </button>
        )}
      </div>
    );
  };

  const renderVideoStatus = () => {
    if (!videoStatus) return null;

    const statusStyles = {
      processing: {
        bg: 'bg-blue-900/20',
        border: 'border-blue-700/50',
        text: 'text-blue-200',
        icon: <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
      },
      completed: {
        bg: 'bg-green-900/20',
        border: 'border-green-700/50',
        text: 'text-green-200',
        icon: <Sparkles className="h-5 w-5 text-green-400" />
      },
      failed: {
        bg: 'bg-red-900/20',
        border: 'border-red-700/50',
        text: 'text-red-200',
        icon: <FileVideo className="h-5 w-5 text-red-400" />
      }
    };

    const style = statusStyles[videoStatus.status as keyof typeof statusStyles] || statusStyles.processing;

    return (
      <div className={`mt-6 p-4 rounded-xl ${style.bg} ${style.border} ${style.text}`}>
        <div className="flex items-center gap-2 mb-2">
          {style.icon}
          <span className="font-medium">
            {videoStatus.status === 'processing' && 'Processing video...'}
            {videoStatus.status === 'completed' && 'Video completed!'}
            {videoStatus.status === 'failed' && 'Video generation failed'}
          </span>
        </div>
        {videoStatus.error && <p className="mt-2 text-sm opacity-80">{videoStatus.error}</p>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <UserSquare2 className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Create Avatar Video</h1>
            <p className="text-gray-400">Generate professional videos with AI-powered avatars</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 text-red-200 rounded-xl border border-red-700/50 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <FileVideo className="h-4 w-4 text-red-400" />
            </div>
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-900/20 text-green-200 rounded-xl border border-green-700/50 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-4 w-4 text-green-400" />
            </div>
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 shadow-xl">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-200">
                    Title
                  </label>
                  <input
                    type="text"
                    {...form.register('title')}
                    placeholder="Enter video title"
                    className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-200 placeholder-gray-500"
                  />
                  {form.formState.errors.title && (
                    <p className="mt-2 text-sm text-red-400">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-200">
                    Script
                  </label>
                  <textarea
                    {...form.register('input_text')}
                    rows={4}
                    placeholder="Enter the script for the avatar to speak"
                    className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-200 placeholder-gray-500 resize-none"
                  />
                  {form.formState.errors.input_text && (
                    <p className="mt-2 text-sm text-red-400">
                      {form.formState.errors.input_text.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-200 flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-400" />
                      Avatar
                    </label>
                    <select
                      {...form.register('avatar_pose_id')}
                      className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-200"
                    >
                      <option value="" className="bg-gray-900">Select avatar</option>
                      {avatars.map((avatar) => (
                        <option
                          key={avatar.avatar_id}
                          value={avatar.avatar_id}
                          className="bg-gray-900"
                        >
                          {`${avatar.avatar_name} (${avatar.gender})`}
                        </option>
                      ))}
                    </select>
                    {selectedAvatar?.premium && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs font-medium text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                          <Crown className="h-3 w-3" />
                          Premium
                        </span>
                      </div>
                    )}
                    {form.formState.errors.avatar_pose_id && (
                      <p className="mt-2 text-sm text-red-400">
                        {form.formState.errors.avatar_pose_id.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-200 flex items-center gap-2">
                      <Mic className="h-4 w-4 text-blue-400" />
                      Voice
                    </label>
                    <select
                      {...form.register('voice_id')}
                      className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-200"
                    >
                      <option value="" className="bg-gray-900">Select voice</option>
                      {voices.map((voice) => (
                        <option
                          key={voice.voice_id}
                          value={voice.voice_id}
                          className="bg-gray-900"
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
                          className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full flex items-center gap-1 hover:bg-blue-500/20 transition-colors"
                        >
                          <Mic className="h-3 w-3" />
                          Preview Voice
                        </button>
                        {selectedVoice.emotion_support && (
                          <span className="text-xs font-medium text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full">
                            Emotion Support
                          </span>
                        )}
                        {selectedVoice.support_interactive_avatar && (
                          <span className="text-xs font-medium text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full">
                            Interactive
                          </span>
                        )}
                      </div>
                    )}
                    {form.formState.errors.voice_id && (
                      <p className="mt-2 text-sm text-red-400">
                        {form.formState.errors.voice_id.message}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-blue-900/20 transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Settings2 className="h-5 w-5" />
                      <span>Generate Video</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <Video className="h-5 w-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-200">
                  {videoStatus?.video_url ? 'Generated Video' : 'Preview'}
                </h2>
              </div>
              {renderVideoPreview()}
              {renderVideoStatus()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AvatarVideoCreator