"use client";

import { configureStore } from '@reduxjs/toolkit';
import { BookAPI } from './ApiSlice';

export const store = configureStore({
  reducer: {
    [BookAPI.reducerPath]: BookAPI.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(BookAPI.middleware),
});
