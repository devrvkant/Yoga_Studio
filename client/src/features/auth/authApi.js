import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({ baseUrl: '' }), // Proxy handles /api
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: '/api/auth/login',
                method: 'POST',
                body: credentials,
            }),
        }),
        register: builder.mutation({
            query: (userData) => ({
                url: '/api/auth/register',
                method: 'POST',
                body: userData,
            }),
        }),
        logout: builder.mutation({
            query: () => ({
                url: '/api/auth/logout',
                method: 'GET',
            }),
        }),
        getMe: builder.query({
            query: () => '/api/auth/me',
        }),
        getUsers: builder.query({
            query: ({ page = 1, limit = 20 } = {}) => `/api/auth/users?page=${page}&limit=${limit}`,
            providesTags: ['User'],
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useGetMeQuery,
    useGetUsersQuery,
} = authApi;
