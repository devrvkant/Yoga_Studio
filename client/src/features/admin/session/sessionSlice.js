import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedSession: null,
    isModalOpen: false,
};

const sessionSlice = createSlice({
    name: 'session',
    initialState,
    reducers: {
        setSelectedSession: (state, action) => {
            state.selectedSession = action.payload;
        },
        openSessionModal: (state) => {
            state.isModalOpen = true;
        },
        closeSessionModal: (state) => {
            state.isModalOpen = false;
            state.selectedSession = null;
        },
    },
});

export const { setSelectedSession, openSessionModal, closeSessionModal } = sessionSlice.actions;
export default sessionSlice.reducer;
