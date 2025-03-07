'use client';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_APP_API_URL || 'https://heygen-backend.onrender.com';
export const userRequest = axios.create({
  baseURL: BASE_URL,
});

userRequest.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token') || '';
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);