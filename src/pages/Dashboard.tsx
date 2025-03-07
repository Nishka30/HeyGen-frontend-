import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { videoTranslation } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { LogOut, Video } from 'lucide-react';

const schema = z.object({
  video_url: z.string().url(),
  output_language: z.string(),
  title: z.string().optional(),
});

interface Language {
  code: string;
  name: string;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [translations, setTranslations] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const user = useAuthStore((state) => state.user);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    loadLanguages();
  }, []);

  const loadLanguages = async () => {
    try {
      const response = await videoTranslation.getSupportedLanguages();
      setLanguages(response.data);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load supported languages',
      });
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      const response = await videoTranslation.translateVideo(data);
      setTranslations([response.data, ...translations]);
      reset();
      toast({
        title: 'Success',
        description: 'Video translation started',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to start translation',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Video className="h-6 w-6 text-blue-600" />
              <span className="ml-2 text-xl font-semibold">Video Translator</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Welcome, {user?.name}</span>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Translate New Video</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video_url">Video URL</Label>
              <Input
                id="video_url"
                placeholder="https://example.com/video.mp4"
                {...register('video_url')}
                className={errors.video_url ? 'border-red-500' : ''}
              />
              {errors.video_url && (
                <p className="text-red-500 text-sm">{errors.video_url.message as string}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="output_language">Target Language</Label>
              <select
                id="output_language"
                {...register('output_language')}
                className="w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Select a language</option>
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              {errors.output_language && (
                <p className="text-red-500 text-sm">
                  {errors.output_language.message as string}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title (Optional)</Label>
              <Input id="title" {...register('title')} />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Translating...' : 'Translate Video'}
            </Button>
          </form>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Translation History</h2>
          <div className="space-y-4">
            {translations.map((translation) => (
              <div
                key={translation.id}
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-medium">{translation.title || 'Untitled'}</h3>
                  <p className="text-sm text-gray-500">
                    Status: {translation.status}
                  </p>
                </div>
                {translation.url && (
                  <Button
                    as="a"
                    href={translation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}