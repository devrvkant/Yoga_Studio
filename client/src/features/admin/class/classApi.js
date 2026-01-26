import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const classApi = createApi({
    reducerPath: 'classApi',
    baseQuery: fetchBaseQuery({ baseUrl: '' }), // Proxy handles /api
    tagTypes: ['Class'],
    endpoints: (builder) => ({
        getClasses: builder.query({
            query: ({ page = 1, limit = 12, level = '' } = {}) => {
                let url = `/api/classes?page=${page}&limit=${limit}`;
                if (level && level !== 'All Classes') {
                    url += `&level=${encodeURIComponent(level)}`;
                }
                return url;
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.data.map(({ _id }) => ({ type: 'Class', id: _id })),
                        { type: 'Class', id: 'LIST' },
                    ]
                    : [{ type: 'Class', id: 'LIST' }],
        }),
        getClass: builder.query({
            query: (id) => `/api/classes/${id}`,
            providesTags: (result, error, id) => [{ type: 'Class', id }],
        }),
        addClass: builder.mutation({
            query: (classData) => ({
                url: '/api/classes',
                method: 'POST',
                body: classData,
            }),
            invalidatesTags: [{ type: 'Class', id: 'LIST' }],
        }),
        updateClass: builder.mutation({
            query: ({ id, ...classData }) => ({
                url: `/api/classes/${id}`,
                method: 'PUT',
                body: classData,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Class', id },
                { type: 'Class', id: 'LIST' }
            ],
        }),
        deleteClass: builder.mutation({
            query: (id) => ({
                url: `/api/classes/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'Class', id: 'LIST' }],
        }),
        enrollClass: builder.mutation({
            query: (id) => ({
                url: `/api/classes/${id}/enroll`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Class', id },
                { type: 'Class', id: 'LIST' } // Invalidate list to update "isEnrolled" status (if included in list)
            ],
        }),
    }),
});

export const {
    useGetClassesQuery,
    useGetClassQuery,
    useAddClassMutation,
    useUpdateClassMutation,
    useDeleteClassMutation,
    useEnrollClassMutation,
} = classApi;

