import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { userRequest } from '@/lib/axiosInstance'; // Adjust the import path accordingly

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' }
];

const formSchema = z.object({
  video_url: z.string().url('Please enter a valid URL'),
  title: z.string().min(1, 'Title is required'),
  output_language: z.string().min(1, 'Please select a language')
});

export function VideoUploader() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      video_url: '',
      title: '',
      output_language: ''
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await userRequest.post('/api/heygen/videos', {
        ...values,
        translate_audio_only: false,
        enable_dynamic_duration: true
      });

      if (response.status !== 200) {
        throw new Error('Failed to upload video');
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
      <h2 className="text-2xl font-bold mb-6 text-gray-200">Upload Video</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-900/50 text-red-400 rounded-md border border-red-700">
          {error}
        </div>
      )}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">
            Video URL
          </label>
          <input
            type="url"
            {...form.register('video_url')}
            placeholder="Enter video URL (YouTube, Drive, or direct link)"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200 placeholder-gray-400"
          />
          {form.formState.errors.video_url && (
            <p className="mt-1 text-sm text-red-400">
              {form.formState.errors.video_url.message}
            </p>
          )}
        </div>

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
            Output Language
          </label>
          <select
            {...form.register('output_language')}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200"
          >
            <option value="" className="bg-gray-700">Select language</option>
            {SUPPORTED_LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code} className="bg-gray-700">
                {lang.name}
              </option>
            ))}
          </select>
          {form.formState.errors.output_language && (
            <p className="mt-1 text-sm text-red-400">
              {form.formState.errors.output_language.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Upload className="h-5 w-5" />
          {isLoading ? 'Processing...' : 'Upload Video'}
        </button>
      </form>
    </div>
  );
}