import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const sessionApi = createApi({
    reducerPath: 'sessionApi',
    baseQuery: fetchBaseQuery({ baseUrl: '' }), // Proxy handles /api
    tagTypes: ['Session'],
    endpoints: (builder) => ({
        getSessionsByCourse: builder.query({
            query: (courseId) => `/api/courses/${courseId}/sessions`,
            providesTags: (result, error, courseId) =>
                result?.data
                    ? [
                        ...result.data.map(({ _id }) => ({ type: 'Session', id: _id })),
                        { type: 'Session', id: `COURSE_${courseId}` }
                    ]
                    : [{ type: 'Session', id: `COURSE_${courseId}` }],
        }),

        getSession: builder.query({
            query: ({ courseId, sessionId }) => `/api/courses/${courseId}/sessions/${sessionId}`,
            providesTags: (result, error, { sessionId }) => [{ type: 'Session', id: sessionId }],
        }),

        addSession: builder.mutation({
            query: ({ courseId, ...sessionData }) => ({
                url: `/api/courses/${courseId}/sessions`,
                method: 'POST',
                body: sessionData,
            }),
            invalidatesTags: (result, error, { courseId }) => [{ type: 'Session', id: `COURSE_${courseId}` }],
            // Optimistic Update - add temp item that gets replaced on server response
            async onQueryStarted({ courseId, ...sessionData }, { dispatch, queryFulfilled }) {
                const tempId = 'temp-' + Date.now();
                const patchResult = dispatch(
                    sessionApi.util.updateQueryData('getSessionsByCourse', courseId, (draft) => {
                        if (draft.data) {
                            const maxOrder = draft.data.reduce((max, s) => Math.max(max, s.order || 0), 0);
                            draft.data.push({
                                ...sessionData,
                                _id: tempId,
                                courseId,
                                order: maxOrder + 1,
                                createdAt: new Date().toISOString()
                            });
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

        updateSession: builder.mutation({
            query: ({ courseId, sessionId, ...sessionData }) => ({
                url: `/api/courses/${courseId}/sessions/${sessionId}`,
                method: 'PUT',
                body: sessionData,
            }),
            invalidatesTags: (result, error, { courseId, sessionId }) => [
                { type: 'Session', id: sessionId },
                { type: 'Session', id: `COURSE_${courseId}` }
            ],
            // Optimistic Update
            async onQueryStarted({ courseId, sessionId, ...sessionData }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    sessionApi.util.updateQueryData('getSessionsByCourse', courseId, (draft) => {
                        const session = draft.data?.find((s) => s._id === sessionId);
                        if (session) {
                            Object.assign(session, sessionData);
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

        deleteSession: builder.mutation({
            query: ({ courseId, sessionId }) => ({
                url: `/api/courses/${courseId}/sessions/${sessionId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { courseId }) => [{ type: 'Session', id: `COURSE_${courseId}` }],
            // Optimistic Update
            async onQueryStarted({ courseId, sessionId }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    sessionApi.util.updateQueryData('getSessionsByCourse', courseId, (draft) => {
                        if (draft.data) {
                            draft.data = draft.data.filter((s) => s._id !== sessionId);
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

        reorderSessions: builder.mutation({
            query: ({ courseId, sessionOrders }) => ({
                url: `/api/courses/${courseId}/sessions/reorder`,
                method: 'PUT',
                body: { sessionOrders },
            }),
            invalidatesTags: (result, error, { courseId }) => [{ type: 'Session', id: `COURSE_${courseId}` }],
            // Optimistic Update
            async onQueryStarted({ courseId, sessionOrders }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    sessionApi.util.updateQueryData('getSessionsByCourse', courseId, (draft) => {
                        if (draft.data) {
                            sessionOrders.forEach(({ id, order }) => {
                                const session = draft.data.find((s) => s._id === id);
                                if (session) {
                                    session.order = order;
                                }
                            });
                            draft.data.sort((a, b) => a.order - b.order);
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
    }),
});

export const {
    useGetSessionsByCourseQuery,
    useGetSessionQuery,
    useAddSessionMutation,
    useUpdateSessionMutation,
    useDeleteSessionMutation,
    useReorderSessionsMutation,
} = sessionApi;
