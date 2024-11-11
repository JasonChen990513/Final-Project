import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './combineRducer';

export const store = configureStore({
	reducer: rootReducer,
});
