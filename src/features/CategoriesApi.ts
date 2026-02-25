import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Category, CategoryPayload } from '@/types/category';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3035/api/v1';

const unwrapData = <T>(response: unknown): T => {
  const data = (response as { data?: unknown })?.data;
  const nested = (data as { data?: unknown })?.data;
  return (nested ?? data) as T;
};

export const categoriesApi = createApi({
  reducerPath: 'categoriesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authAccessToken');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Categories'],
  endpoints: (builder) => ({
    getActiveCategories: builder.query<Category[], void>({
      query: () => '/categories/active',
      transformResponse: (response: unknown) => unwrapData<Category[]>(response),
      providesTags: ['Categories'],
    }),
    createCategory: builder.mutation<Category, CategoryPayload>({
      query: (body) => ({
        url: '/categories',
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => unwrapData<Category>(response),
      invalidatesTags: ['Categories'],
    }),
    updateCategory: builder.mutation<
      Category,
      { id: string; body: Partial<CategoryPayload> }
    >({
      query: ({ id, body }) => ({
        url: `/categories/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: unknown) => unwrapData<Category>(response),
      invalidatesTags: ['Categories'],
    }),
    deleteCategory: builder.mutation<{ message?: string }, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Categories'],
    }),
  }),
});

export const {
  useGetActiveCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;
