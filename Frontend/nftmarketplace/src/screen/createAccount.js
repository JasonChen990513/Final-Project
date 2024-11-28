import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useActionsCreator } from "../hook/useActionsCreator";
import { useState, useEffect } from "react";
import { connectWallet } from "../util/contract";



const CreateAccount = () => {
    const navigate = useNavigate();
    const { UserLogin } = useActionsCreator();

    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [userAddress, setUserAddress] = useState('');

    useEffect(() => {
        const initPage = async () => {  
            const { account, signer, provider } = await connectWallet();
            //console.log(account);
            setUserAddress(account);
        }
        initPage();
    })
    

    const createAccount = async() => {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('address', userAddress);
        formData.append('password', password);

        try {
            const response = await axios.post('http://localhost:5000/api/v1/user/register', {
              name: name,
              address: userAddress,
              password: password
            });
        
            console.log('Response:', response.data);


          } catch (error) {
            console.error('Error sending data:', error);
          }
    }

    window.ethereum?.on('accountsChanged', accounts => {
        setUserAddress(accounts?.length < 1 ? '' : accounts[0]);
    });

    return (
        <div>
            <div>
                <div className="flex flex-col items-center gap-5">
                    <div className="text-3xl font-bold">Create New Account</div>
                    <input type="text" placeholder="User Address" className="w-1/4 border border-black rounded-xl p-2" value={userAddress} onChange={(e) => setUserAddress(e.target.value)} disabled/>
                    <input type="text" placeholder="Name" className="w-1/4 border border-black rounded-xl p-2" value={name} onChange={(e) => setName(e.target.value)}/>
                    <input type="text" placeholder="Password" className="w-1/4 border border-black rounded-xl p-2" value={password} onChange={(e) => setPassword(e.target.value)}/>
                    <button className="w-fit border border-black rounded-xl p-2" onClick={createAccount}>Create</button>
                </div>
            </div>
        </div>
    )
}

export default CreateAccount;