import { useDispatch } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
import { UserLogin, UserLogout } from '../store/userSlice';
import { setNFT } from '../store/nftSlice';

export const useActionsCreator = () => {
    const dispatch = useDispatch();
    return bindActionCreators({ UserLogin, UserLogout, setNFT }, dispatch);
};