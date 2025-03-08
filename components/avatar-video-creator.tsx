import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserSquare2 } from 'lucide-react';
import { userRequest } from '@/lib/axiosInstance';

const formSchema = z.object({
  avatar_pose_id: z.string().min(1, 'Avatar pose is required'),
  input_text: z.string().min(1, 'Script is required'),
  voice_id: z.string().min(1, 'Voice is required'),
  title: z.string().min(1, 'Title is required'),
});

export function AvatarVideoCreator() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      avatar_pose_id: '',
      input_text: '',
      voice_id: '',
      title: '',
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await userRequest.post('/api/heygen/avatar-videos', {
        ...values,
        dimension: { width: 1280, height: 720 },
        avatar_style: 'normal'
      });

      if (response.status !== 200) {
        throw new Error('Failed to create avatar video');
      }

      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-gray-200">Create Avatar Video</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-900/50 text-red-400 rounded-md border border-red-700">
          {error}
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
          <label className="block text-sm font-medium mb-1 text-gray-300">
            Avatar
          </label>
          <select
            {...form.register('avatar_pose_id')}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200"
          >
            <option value="" className="bg-gray-700">Select avatar</option>
            <option value="Vanessa-invest-20220722" className="bg-gray-700">Vanessa</option>
            {/* Add more avatars here */}
          </select>
          {form.formState.errors.avatar_pose_id && (
            <p className="mt-1 text-sm text-red-400">
              {form.formState.errors.avatar_pose_id.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">
            Voice
          </label>
          <select
            {...form.register('voice_id')}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200"
          >
            <option value="" className="bg-gray-700">Select voice</option>
            <option value="1bd001e7e50f421d891986aad5158bc8" className="bg-gray-700">Default Voice</option>
            {/* Add more voices here */}
          </select>
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
          <UserSquare2 className="h-5 w-5" />
          {isLoading ? 'Creating...' : 'Create Avatar Video'}
        </button>
      </form>
    </div>
  );
}