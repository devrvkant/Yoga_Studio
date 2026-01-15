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
            invalidatesTags: ['Course'],
            // Optimistic Update - add temp item that gets replaced on server response
            async onQueryStarted(courseData, { dispatch, queryFulfilled }) {
                const tempId = 'temp-' + Date.now();
                const patchResult = dispatch(
                    courseApi.util.updateQueryData('getCourses', undefined, (draft) => {
                        const courses = draft.data || draft;
                        courses.unshift({ ...courseData, _id: tempId, createdAt: new Date().toISOString() });
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
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
                        // Handle both { data: [...] } wrapper and direct array
                        const courses = draft.data || draft;
                        const existingCourse = courses.find((c) => c._id === id);
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
                        // Handle both { data: [...] } wrapper and direct array
                        if (draft.data) {
                            draft.data = draft.data.filter((c) => c._id !== id);
                        } else {
                            return draft.filter((c) => c._id !== id);
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
        enrollCourse: builder.mutation({
            query: (id) => ({
                url: `/api/courses/${id}/enroll`,
                method: 'POST',
            }),
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

