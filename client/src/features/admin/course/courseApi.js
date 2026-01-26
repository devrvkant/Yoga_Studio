import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const courseApi = createApi({
    reducerPath: 'courseApi',
    baseQuery: fetchBaseQuery({ baseUrl: '' }), // Proxy handles /api
    tagTypes: ['Course'],
    endpoints: (builder) => ({
        getCourses: builder.query({
            query: ({ page = 1, limit = 12, level = '', search = '' } = {}) => {
                let url = `/api/courses?page=${page}&limit=${limit}`;
                if (level && level !== 'All Courses') {
                    url += `&level=${encodeURIComponent(level)}`;
                }
                if (search && search.trim()) {
                    url += `&search=${encodeURIComponent(search.trim())}`;
                }
                return url;
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.data.map(({ _id }) => ({ type: 'Course', id: _id })),
                        { type: 'Course', id: 'LIST' },
                    ]
                    : [{ type: 'Course', id: 'LIST' }],
        }),
        getCourse: builder.query({
            query: (id) => `/api/courses/${id}`,
            providesTags: (result, error, id) => [{ type: 'Course', id }],
        }),
        addCourse: builder.mutation({
            query: (courseData) => ({
                url: '/api/courses',
                method: 'POST',
                body: courseData,
            }),
            invalidatesTags: [{ type: 'Course', id: 'LIST' }],
        }),
        updateCourse: builder.mutation({
            query: ({ id, ...courseData }) => ({
                url: `/api/courses/${id}`,
                method: 'PUT',
                body: courseData,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Course', id },
                { type: 'Course', id: 'LIST' }
            ],
        }),
        deleteCourse: builder.mutation({
            query: (id) => ({
                url: `/api/courses/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'Course', id: 'LIST' }],
        }),
        enrollCourse: builder.mutation({
            query: (id) => ({
                url: `/api/courses/${id}/enroll`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Course', id },
                { type: 'Course', id: 'LIST' }
            ],
        }),
    }),
});

export const {
    useGetCoursesQuery,
    useGetCourseQuery,
    useAddCourseMutation,
    useUpdateCourseMutation,
    useDeleteCourseMutation,
    useEnrollCourseMutation,
} = courseApi;

