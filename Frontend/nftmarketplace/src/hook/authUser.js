import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useActionsCreator } from './useActionsCreator';

const AuthUser = Component => {
	const Auth = props => {
        const [token, setToken] = useState(useSelector(state => state.user.token));
		const navigate = useNavigate();
        const { UserLogout } = useActionsCreator();


		useEffect(() => {
			if (!token) {
                //alert('You are not logged in');
                navigate('/login');
            }
		}, [token]);

        window.ethereum?.on('accountsChanged', accounts => {
            UserLogout();
            setToken('');
        });

		return <Component {...props} />;
	};

	return Auth;
};

export default AuthUser;
