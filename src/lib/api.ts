import axios from 'axios';
import { useAuthStore } from './store';

const api = axios.create({
  baseURL: 'https://heygen-backend.onrender.com/api',
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
};

export const videoTranslation = {
  getSupportedLanguages: () =>
    api.get('/heygen/languages'),
  translateVideo: (data: {
    video_url: string;
    output_language: string;
    title?: string;
    translate_audio_only?: boolean;
  }) => api.post('/heygen/translate', data),
  getTranslationStatus: (id: string) =>
    api.get(`/heygen/translate/${id}`),
};

export default api;