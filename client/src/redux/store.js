import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';
import { authApi } from '../features/auth/authApi.js';
import classReducer from '../features/admin/class/classSlice.js';
import { classApi } from '../features/admin/class/classApi.js';
import courseReducer from '../features/admin/course/courseSlice.js';
import { courseApi } from '../features/admin/course/courseApi.js';
import sessionReducer from '../features/admin/session/sessionSlice.js';
import { sessionApi } from '../features/admin/session/sessionApi.js';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        [authApi.reducerPath]: authApi.reducer,
        class: classReducer,
        [classApi.reducerPath]: classApi.reducer,
        course: courseReducer,
        [courseApi.reducerPath]: courseApi.reducer,
        session: sessionReducer,
        [sessionApi.reducerPath]: sessionApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            authApi.middleware,
            classApi.middleware,
            courseApi.middleware,
            sessionApi.middleware
        ),
});

