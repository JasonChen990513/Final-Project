import axios from "axios";
import { useState, useEffect } from "react";
import { connectWallet } from "../util/contract";
import { useNavigate } from "react-router-dom";
import { useActionsCreator } from "../hook/useActionsCreator";
import { useSelector } from "react-redux";
import { serverUrl } from "../util/constant";

const Login = () => {
    const user = useSelector(state => state.user);
    const token = user.token;

    //console.log('this is the token: ' + user.name + ' and ' + user.token);

    const [ address, setAddress ] = useState('');
    const [ password, setPassword ] = useState('');

    const navigate = useNavigate();
    const { UserLogin } = useActionsCreator();

    useEffect(() => {
        const initPage = async () => {  
            const { account, signer, provider } = await connectWallet();
            //console.log(account);
            setAddress(account);
        }
        if (token) navigate('/homepage');
        initPage();
    }, [address]);

    const handleLogin = async () => {
        console.log('in handleLogin');
        axios.defaults.withCredentials = true;
        try {
            const response = await axios.post(serverUrl + '/api/v1/user/login', {
                address: address,
                password: password
            });
            console.log(response);
            console.log('finish login');
    
            // console.log(response.data);
            // console.log(response.data?.data?.token);
            UserLogin({name: response.data?.data?.username, token: response.data?.data?.token});
            navigate('/homepage');
        } catch (error) {
            alert(error.response.data.message);
        }




    }

    
    window.ethereum?.on('accountsChanged', accounts => {
        setAddress(accounts?.length < 1 ? '' : accounts[0]);
    });


    return (
        <div>
            <div>
                <div className="flex flex-col items-center gap-5">
                    <div className="text-3xl font-bold">User Login</div>
                    <input type="text" placeholder="User Address" className="w-1/4 border border-black rounded-xl p-2" disabled value={address}/>
                    <input type="text" placeholder="Password" className="w-1/4 border border-black rounded-xl p-2" onChange={(e) => setPassword(e.target.value)} value={password}/>
                    <button className="w-fit border border-black rounded-xl p-2" onClick={handleLogin}>Login</button>
                    <div className="text-gray-400 cursor-pointer" onClick={() => navigate('/createAccount')}>No account? register here</div>
                </div>
            </div>
        </div>
    )
}

export default Login;