import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './combineRducer';
import { persistStore } from 'redux-persist';

export const store = configureStore({
	reducer: rootReducer,
});

export const persistedStore = persistStore(store);
