import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedClass: null,
};

const classSlice = createSlice({
    name: 'class',
    initialState,
    reducers: {
        setSelectedClass: (state, action) => {
            state.selectedClass = action.payload;
        },
        clearSelectedClass: (state) => {
            state.selectedClass = null;
        },
    },
});

export const { setSelectedClass, clearSelectedClass } = classSlice.actions;

export default classSlice.reducer;
