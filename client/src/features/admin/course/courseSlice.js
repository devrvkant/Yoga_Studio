import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedCourse: null,
};

const courseSlice = createSlice({
    name: 'course',
    initialState,
    reducers: {
        setSelectedCourse: (state, action) => {
            state.selectedCourse = action.payload;
        },
        clearSelectedCourse: (state) => {
            state.selectedCourse = null;
        },
    },
});

export const { setSelectedCourse, clearSelectedCourse } = courseSlice.actions;

export default courseSlice.reducer;
