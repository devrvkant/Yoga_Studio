import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const paymentApi = createApi({
    reducerPath: 'paymentApi',
    baseQuery: fetchBaseQuery({ baseUrl: '' }), // Proxy handles /api
    tagTypes: ['Payment'],
    endpoints: (builder) => ({
        // Get checkout URL for purchasing a class/course
        getCheckoutUrl: builder.mutation({
            query: ({ itemType, itemId }) => ({
                url: '/api/payments/checkout',
                method: 'POST',
                body: { itemType, itemId },
            }),
        }),

        // Get user's payment history
        getPaymentHistory: builder.query({
            query: () => '/api/payments/history',
            providesTags: ['Payment'],
        }),

        // Admin: Get all payments
        getAllPayments: builder.query({
            query: ({ page = 1, limit = 20 } = {}) =>
                `/api/payments?page=${page}&limit=${limit}`,
            providesTags: ['Payment'],
        }),
    }),
});

export const {
    useGetCheckoutUrlMutation,
    useGetPaymentHistoryQuery,
    useGetAllPaymentsQuery,
} = paymentApi;
