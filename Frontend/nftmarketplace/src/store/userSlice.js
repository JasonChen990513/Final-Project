import { createSlice } from '@reduxjs/toolkit';

export const userSlice = createSlice({
	name: 'user',
	initialState: {
		name: '',
		token: '',
	},
	reducers: {
		UserLogin: (state, action) => {
			state.name = action.payload.name;
			state.token = action.payload.token;
		},

		UserLogout: state => {
			state.name = '';
			state.token = '';
		},
	},
});

export const { UserLogin, UserLogout } = userSlice.actions;
export default userSlice.reducer;