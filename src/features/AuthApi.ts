import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { LoginCredentials, LoginResponseEnvelope } from '@/types/user';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3035/api/v1';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
  }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponseEnvelope['data'], LoginCredentials>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      transformResponse: (response: LoginResponseEnvelope) => response.data,
    }),
  }),
});

export const { useLoginMutation } = authApi;
