import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  Course,
  CourseLesson,
  CourseModule,
  CreateCoursePayload,
  CreateLessonPayload,
  CreateModulePayload,
  UpdateCoursePayload,
  UpdateLessonPayload,
  UpdateModulePayload,
} from '@/types/course';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3035/api/v1';

const unwrapData = <T>(response: unknown): T => {
  const data = (response as { data?: unknown })?.data;
  const nested = (data as { data?: unknown })?.data;
  if (nested !== undefined || data !== undefined) return (nested ?? data) as T;

  const raw = response as Record<string, unknown>;
  const { message: _message, count: _count, ...rest } = raw;
  return rest as T;
};

export const coursesApi = createApi({
  reducerPath: 'coursesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authAccessToken');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Courses'],
  endpoints: (builder) => ({
    getCourseById: builder.query<Course, string>({
      query: (courseId) => `/courses/${courseId}`,
      transformResponse: (response: unknown) => unwrapData<Course>(response),
      providesTags: (_result, _error, id) => [{ type: 'Courses', id }],
    }),
    getCoursesByClub: builder.query<Course[], string>({
      query: (clubId) => `/courses/club/${clubId}`,
      transformResponse: (response: unknown) => unwrapData<Course[]>(response),
      providesTags: ['Courses'],
    }),
    getCoursesByClubIds: builder.query<Course[], string[]>({
      async queryFn(clubIds, _queryApi, _extraOptions, fetchWithBQ) {
        if (!clubIds.length) return { data: [] };
        const responses = await Promise.all(
          clubIds.map((clubId) => fetchWithBQ(`/courses/club/${clubId}`)),
        );
        const merged = responses.flatMap((result) => {
          if (result.error || !result.data) return [];
          const payload = result.data as unknown;
          return unwrapData<Course[]>(payload) ?? [];
        });

        return { data: merged };
      },
      providesTags: ['Courses'],
    }),
    createCourse: builder.mutation<Course, CreateCoursePayload>({
      query: (body) => ({
        url: '/courses',
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => unwrapData<Course>(response),
      invalidatesTags: ['Courses'],
    }),
    updateCourse: builder.mutation<
      Course,
      { id: string; body: UpdateCoursePayload }
    >({
      query: ({ id, body }) => ({
        url: `/courses/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: unknown) => unwrapData<Course>(response),
      invalidatesTags: (_result, _error, { id }) => ['Courses', { type: 'Courses', id }],
    }),
    deleteCourse: builder.mutation<{ message?: string }, string>({
      query: (id) => ({
        url: `/courses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Courses'],
    }),
    publishCourse: builder.mutation<Course, string>({
      query: (courseId) => ({
        url: `/courses/${courseId}/publish`,
        method: 'POST',
      }),
      transformResponse: (response: unknown) => unwrapData<Course>(response),
      invalidatesTags: (_result, _error, id) => ['Courses', { type: 'Courses', id }],
    }),
    createModule: builder.mutation<
      CourseModule,
      { courseId: string; body: CreateModulePayload }
    >({
      query: ({ courseId, body }) => ({
        url: `/courses/${courseId}/modules`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => unwrapData<CourseModule>(response),
      invalidatesTags: ['Courses'],
    }),
    updateModule: builder.mutation<
      CourseModule,
      { moduleId: string; body: UpdateModulePayload }
    >({
      query: ({ moduleId, body }) => ({
        url: `/courses/modules/${moduleId}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: unknown) => unwrapData<CourseModule>(response),
      invalidatesTags: ['Courses'],
    }),
    deleteModule: builder.mutation<{ message?: string }, string>({
      query: (moduleId) => ({
        url: `/courses/modules/${moduleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Courses'],
    }),
    createLesson: builder.mutation<
      CourseLesson,
      { moduleId: string; body: CreateLessonPayload }
    >({
      query: ({ moduleId, body }) => ({
        url: `/courses/modules/${moduleId}/lessons`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => unwrapData<CourseLesson>(response),
      invalidatesTags: ['Courses'],
    }),
    updateLesson: builder.mutation<
      CourseLesson,
      { lessonId: string; body: UpdateLessonPayload }
    >({
      query: ({ lessonId, body }) => ({
        url: `/courses/lessons/${lessonId}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: unknown) => unwrapData<CourseLesson>(response),
      invalidatesTags: ['Courses'],
    }),
    deleteLesson: builder.mutation<{ message?: string }, string>({
      query: (lessonId) => ({
        url: `/courses/lessons/${lessonId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Courses'],
    }),
  }),
});

export const {
  useGetCourseByIdQuery,
  useGetCoursesByClubQuery,
  useGetCoursesByClubIdsQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  usePublishCourseMutation,
  useCreateModuleMutation,
  useUpdateModuleMutation,
  useDeleteModuleMutation,
  useCreateLessonMutation,
  useUpdateLessonMutation,
  useDeleteLessonMutation,
} = coursesApi;
