import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3035/api/v1';

export type PoolDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

type GeneratePoolRequest = {
  poolType: 'CATEGORY' | 'CLUB';
  categoryId?: string;
  clubId?: string;
  difficulty: PoolDifficulty;
};

type GeneratePoolResponse = {
  count: number;
  poolType: 'CATEGORY' | 'CLUB';
  categoryId?: string;
  clubId?: string;
};

const unwrapData = <T>(response: unknown): T => {
  const data = (response as { data?: unknown })?.data;
  const nested = (data as { data?: unknown })?.data;
  return (nested ?? data) as T;
};

export const questionPoolApi = createApi({
  reducerPath: 'questionPoolApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authAccessToken');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    generatePool: builder.mutation<GeneratePoolResponse, GeneratePoolRequest>({
      query: (body) => ({
        url: '/question-pool/generate',
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) =>
        unwrapData<GeneratePoolResponse>(response),
    }),
  }),
});

export const { useGeneratePoolMutation } = questionPoolApi;
