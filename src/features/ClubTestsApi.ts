import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3035/api/v1';

const unwrapData = <T>(response: unknown): T => {
  const data = (response as { data?: unknown })?.data;
  const nested = (data as { data?: unknown })?.data;
  return (nested ?? data) as T;
};

export type ClubTestQuestion = {
  id: string;
  question: string;
  options?: string[];
  orderIndex?: number;
  points?: number;
};

export type ClubMemberTest = {
  id: string;
  clubId: string;
  passingScore: number;
  questions: ClubTestQuestion[];
};

export type SubmitClubTestPayload = {
  userId: string;
  testId: string;
  answers: Record<string, string>;
  purpose: 'JOIN_CLUB';
  targetClubId: string;
};

export type SubmitClubTestResult = {
  passed: boolean;
  score: number;
  attemptId?: string;
  feedback?: string;
};

export type RegisterMemberForClubPayload = {
  fullName: string;
  email: string;
  clubId: string;
};

export type RegisterMemberForClubResponse = {
  userId: string;
  email: string;
  clubId: string;
};

export const clubTestsApi = createApi({
  reducerPath: 'clubTestsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authAccessToken');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    registerMemberForClub: builder.mutation<
      RegisterMemberForClubResponse,
      RegisterMemberForClubPayload
    >({
      query: (body) => ({
        url: '/users/register-member-for-club',
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) =>
        unwrapData<RegisterMemberForClubResponse>(response),
    }),
    getMemberTestByClub: builder.query<ClubMemberTest, string>({
      query: (clubId) => `/tests/club/${clubId}/member-test`,
      transformResponse: (response: unknown) =>
        unwrapData<ClubMemberTest>(response),
    }),
    submitMemberTest: builder.mutation<SubmitClubTestResult, SubmitClubTestPayload>({
      query: (body) => ({
        url: '/tests/submit',
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) =>
        unwrapData<SubmitClubTestResult>(response),
    }),
  }),
});

export const { useGetMemberTestByClubQuery, useSubmitMemberTestMutation } =
  clubTestsApi;
export const { useRegisterMemberForClubMutation } = clubTestsApi;
