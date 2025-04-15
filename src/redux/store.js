// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import bookReducer from './bookSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    bookings: bookReducer,

  },
});
