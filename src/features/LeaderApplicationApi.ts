import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  AdminLeaderApplication,
  LeaderCategoryTest,
  LeaderApplicationStatusResponse,
  LeaderRegisterForTestPayload,
  LeaderRegisterForTestResponse,
  LeaderApplicationReviewStatus,
  LeaderSubmitTestPayload,
  LeaderTestAttempt,
} from '@/types/leaderApplication';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3035/api/v1';

const unwrapData = <T>(response: unknown): T => {
  const data = (response as { data?: unknown })?.data;
  const nested = (data as { data?: unknown })?.data;
  return (nested ?? data) as T;
};

export const leaderApplicationApi = createApi({
  reducerPath: 'leaderApplicationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authAccessToken');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['LeaderApplications'],
  endpoints: (builder) => ({
    registerForTest: builder.mutation<
      LeaderRegisterForTestResponse,
      LeaderRegisterForTestPayload
    >({
      query: (payload) => {
        const formData = new FormData();
        formData.append('fullName', payload.fullName);
        formData.append('email', payload.email);
        formData.append('phone', payload.phone);
        formData.append('bio', payload.bio);
        formData.append('cv', payload.cv);
        if (payload.degree) {
          formData.append('degree', payload.degree);
        }

        return {
          url: '/users/register-for-test',
          method: 'POST',
          body: formData,
        };
      },
      transformResponse: (response: unknown) =>
        unwrapData<LeaderRegisterForTestResponse>(response),
    }),
    getCreatorTestByCategory: builder.query<LeaderCategoryTest, string>({
      query: (categoryId) => `/tests/category/${categoryId}/creator-test`,
      transformResponse: (response: unknown) =>
        unwrapData<LeaderCategoryTest>(response),
    }),
    submitLeaderTest: builder.mutation<LeaderTestAttempt, LeaderSubmitTestPayload>(
      {
        query: (body) => ({
          url: '/tests/submit',
          method: 'POST',
          body,
        }),
        transformResponse: (response: unknown) => {
          const raw = unwrapData<Record<string, unknown>>(response) ?? {};
          const id =
            (raw.id as string | undefined) ??
            (raw.attemptId as string | undefined) ??
            '';
          return {
            ...(raw as LeaderTestAttempt),
            id,
            attemptId: (raw.attemptId as string | undefined) ?? id,
          };
        },
      },
    ),
    uploadLeaderProctoringVideo: builder.mutation<
      LeaderTestAttempt,
      { attemptId: string; video: File }
    >({
      query: ({ attemptId, video }) => {
        const formData = new FormData();
        formData.append('video', video);
        return {
          url: `/tests/attempts/${attemptId}/proctoring-video`,
          method: 'POST',
          body: formData,
        };
      },
      transformResponse: (response: unknown) =>
        unwrapData<LeaderTestAttempt>(response),
    }),
    getAdminLeaderApplications: builder.query<
      AdminLeaderApplication[],
      LeaderApplicationReviewStatus
    >({
      query: (status = 'PENDING') => ({
        url: `/users/creator-applications/pending?status=${status}`,
      }),
      transformResponse: (response: unknown) => {
        const applications = unwrapData<
          Array<{
            userId: string;
            fullName: string;
            email: string;
            globalStatus?: 'active' | 'pending' | 'rejected';
            phone?: string;
            bio?: string;
            cv?: string;
            degree?: string;
            application?: {
              attemptId: string;
              score: number;
              passed?: boolean;
              attemptedAt?: string;
              testId?: string;
              proctoringVideoUrl?: string;
            } | null;
          }>
        >(response);

        const mapReviewStatus = (
          globalStatus?: 'active' | 'pending' | 'rejected',
        ): LeaderApplicationReviewStatus => {
          if (globalStatus === 'active') return 'APPROVED';
          if (globalStatus === 'rejected') return 'REJECTED';
          return 'PENDING';
        };

        return (applications ?? []).map((item) => ({
          id: item.application?.attemptId ?? item.userId,
          score: item.application?.score ?? 0,
          passed: Boolean(item.application?.passed),
          reviewStatus: mapReviewStatus(item.globalStatus),
          proctoringVideoUrl: item.application?.proctoringVideoUrl,
          attemptedAt: item.application?.attemptedAt,
          user: {
            id: item.userId,
            name: item.fullName,
            email: item.email,
            phone: item.phone,
            bio: item.bio,
            cv: item.cv,
            degree: item.degree,
          },
          test: {
            id: item.application?.testId ?? '',
          },
        }));
      },
      providesTags: ['LeaderApplications'],
    }),
    getLeaderApplicationStatus: builder.query<LeaderApplicationStatusResponse, string>({
      query: (userId) => `/tests/leader-applications/status/${userId}`,
      transformResponse: (response: unknown) =>
        unwrapData<LeaderApplicationStatusResponse>(response),
    }),
    reviewLeaderApplication: builder.mutation<
      { success?: boolean; message?: string },
      { userId: string; decision: 'APPROVE' | 'REJECT'; note?: string }
    >({
      query: ({ userId, decision, note }) =>
        decision === 'APPROVE'
          ? {
              url: '/users/approve-creator',
              method: 'POST',
              body: { userId },
            }
          : {
              url: '/users/reject-creator',
              method: 'POST',
              body: { userId, reason: note?.trim() || 'Application rejected by admin.' },
            },
      transformResponse: (response: unknown) =>
        (response as { message?: string; success?: boolean }) ?? {},
      invalidatesTags: ['LeaderApplications'],
    }),
  }),
});

export const {
  useRegisterForTestMutation,
  useGetCreatorTestByCategoryQuery,
  useSubmitLeaderTestMutation,
  useUploadLeaderProctoringVideoMutation,
  useGetAdminLeaderApplicationsQuery,
  useGetLeaderApplicationStatusQuery,
  useReviewLeaderApplicationMutation,
} = leaderApplicationApi;
