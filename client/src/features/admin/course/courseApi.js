import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const courseApi = createApi({
    reducerPath: 'courseApi',
    baseQuery: fetchBaseQuery({ baseUrl: '' }), // Proxy handles /api
    tagTypes: ['Course'],
    endpoints: (builder) => ({
        getCourses: builder.query({
            query: () => '/api/courses',
            providesTags: ['Course'],
        }),
        addCourse: builder.mutation({
            query: (courseData) => ({
                url: '/api/courses',
                method: 'POST',
                body: courseData,
            }),
            invalidatesTags: ['Course'],
        }),
        updateCourse: builder.mutation({
            query: ({ id, ...courseData }) => ({
                url: `/api/courses/${id}`,
                method: 'PUT',
                body: courseData,
            }),
            invalidatesTags: ['Course'],
            // Optimistic Update
            async onQueryStarted({ id, ...courseData }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    courseApi.util.updateQueryData('getCourses', undefined, (draft) => {
                        const existingCourse = draft.find((c) => c._id === id);
                        if (existingCourse) {
                            Object.assign(existingCourse, courseData);
                        }
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
        }),
        deleteCourse: builder.mutation({
            query: (id) => ({
                url: `/api/courses/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Course'],
            // Optimistic Update
            async onQueryStarted(id, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    courseApi.util.updateQueryData('getCourses', undefined, (draft) => {
                        return draft.filter((c) => c._id !== id);
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
        }),
    }),
});

export const {
    useGetCoursesQuery,
    useAddCourseMutation,
    useUpdateCourseMutation,
    useDeleteCourseMutation,
} = courseApi;
