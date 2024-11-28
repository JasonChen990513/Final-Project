import { persistCombineReducers } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import userSlice from './userSlice';
import nftSlice from './nftSlice';

export const rootReducer = persistCombineReducers(
	{ key: 'final-project', storage },
	{
		user: userSlice,
		nfts: nftSlice,
	}
);