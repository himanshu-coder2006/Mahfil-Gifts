import { createSlice } from '@reduxjs/toolkit';

let toastId = 0;

const notificationSlice = createSlice({
  name: 'notification',
  initialState: { toasts: [], message: null, type: 'success' },
  reducers: {
    showNotification: (state, action) => {
      const { message, type = 'success', duration = 3000 } = action.payload;
      const id = ++toastId;
      state.message = message;
      state.type = type;
      state.toasts = [...state.toasts, { id, message, type, duration }];
    },
    dismissToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    clearNotification: (state) => {
      state.message = null;
    },
  },
});

export const { showNotification, dismissToast, clearNotification } = notificationSlice.actions;
export default notificationSlice.reducer;