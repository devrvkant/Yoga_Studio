import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const classApi = createApi({
    reducerPath: 'classApi',
    baseQuery: fetchBaseQuery({ baseUrl: '' }), // Proxy handles /api
    tagTypes: ['Class'],
    endpoints: (builder) => ({
        getClasses: builder.query({
            query: () => '/api/classes',
            providesTags: ['Class'],
        }),
        addClass: builder.mutation({
            query: (classData) => ({
                url: '/api/classes',
                method: 'POST',
                body: classData,
            }),
            invalidatesTags: ['Class'],
            // Optimistic Update - add temp item that gets replaced on server response
            async onQueryStarted(classData, { dispatch, queryFulfilled }) {
                const tempId = 'temp-' + Date.now();
                const patchResult = dispatch(
                    classApi.util.updateQueryData('getClasses', undefined, (draft) => {
                        const classes = draft.data || draft;
                        classes.unshift({ ...classData, _id: tempId, createdAt: new Date().toISOString() });
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
        }),
        updateClass: builder.mutation({
            query: ({ id, ...classData }) => ({
                url: `/api/classes/${id}`,
                method: 'PUT',
                body: classData,
            }),
            invalidatesTags: ['Class'],
            // Optimistic Update
            async onQueryStarted({ id, ...classData }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    classApi.util.updateQueryData('getClasses', undefined, (draft) => {
                        // Handle both { data: [...] } wrapper and direct array
                        const classes = draft.data || draft;
                        const existingClass = classes.find((c) => c._id === id);
                        if (existingClass) {
                            Object.assign(existingClass, classData);
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
        deleteClass: builder.mutation({
            query: (id) => ({
                url: `/api/classes/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Class'],
            // Optimistic Update
            async onQueryStarted(id, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    classApi.util.updateQueryData('getClasses', undefined, (draft) => {
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
        enrollClass: builder.mutation({
            query: (id) => ({
                url: `/api/classes/${id}/enroll`,
                method: 'POST',
            }),
        }),
    }),
});

export const {
    useGetClassesQuery,
    useAddClassMutation,
    useUpdateClassMutation,
    useDeleteClassMutation,
    useEnrollClassMutation,
} = classApi;

