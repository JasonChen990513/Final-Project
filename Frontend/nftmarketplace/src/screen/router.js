import { createBrowserRouter,NavLink, Outlet  } from "react-router-dom";
import '../index.css';
import { useActionsCreator } from "../hook/useActionsCreator";
import { useNavigate } from 'react-router-dom';
import { useEffect } from "react";
import CreateNft from "./createNft";
import Homepage from "./homepage";
import Nft from "./nft";
import Profile from "./profile";
import Login from "./login";
import CreateAccount from "./createAccount";
import ProfileNft from "./profilenft";
import Biding from "./biding";


export const Root = () => {
    const { UserLogout } = useActionsCreator();
    const navigate = useNavigate();

    useEffect(() => {
        //check the network 
        function checkNetwork(){
            // Check if MetaMask is installed and enabled
            if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
                //get current chain id
                window.ethereum.request({ method: 'eth_chainId' })
                .then(chainId => {
                    // Check if the network is the maal testnet or other
                    console.log("this is "+chainId)
                    if (chainId !== '0x1eb4') { //0x1eb4 is maal testnet chain ID
                        // Prompt the user to switch networks
                        if (window.confirm('Please switch to the Maal testnet to continue.')) {
                            SwitchChainToMaal();
                        } else {
                            alert("You need to switch to Maal testnet to contunue.")
                        }
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            } else {
                // MetaMask is not installed or not enabled
                //alert('Please install MetaMask to use this feature.');
                if (typeof window.ethereum === "undefined") {
                    const confirmed = window.confirm(
                    "MetaMask is not installed! Click OK to install it."
                    );
                    if (confirmed) {
                    window.location.href = "https://metamask.io/download.html";
                    }
                }
            }
        }
        //if not maal test net then switch to maal test net
        async function SwitchChainToMaal(){
            try {
                //switch the netword to maal testnet network
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x1eb4' }],
                });
                //after change refresh the page
                window.location.reload();
            } catch (switchError) {
            if (switchError.code === 4902) { // 4902 mean the network not at wallet
                //request to add the chain to wallet here
                if(window.confirm("Maal testnet Chain hasn't been added to the wallet! Do you want to add it now?")){
                    addMaalTestNetwork();
                }
            }
            }
        }
        //if no in wallet, add network to wallet
        async function addMaalTestNetwork() {
            try {
                //add maal testnet network to user wallet
                const result = await window.ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [{
                    chainId: "0x1eb4",
                    rpcUrls: ["https://rpc-bntest.maalscan.io"],
                    chainName: "MaalChain Testnet",
                    nativeCurrency: {
                        name: "MAAL",
                        symbol: "MAAL",
                        decimals: 18
                    },
                    blockExplorerUrls: ["https://testnet.maalscan.io/"]
                    }]
                });
                alert("Add network successfully")
                window.location.reload();
            } catch (error){
                alert("Something wrong " + error)
            }
        } 
        
        checkNetwork();
    }, []);

    const handleLogOut = () => {
		UserLogout();
		navigate('/login');
	};

    return (
        <header>
            <nav className="flex gap-6 justify-center m-4 items-center">
                <NavLink to='/homepage' style={({ isActive }) => (isActive ? { color: 'red' } : {})}>
                    Home
                </NavLink>
                <NavLink to='/profile' style={({ isActive }) => (isActive ? { color: 'red' } : {})}>
                    Profile
                </NavLink>
                <NavLink to='/createNft' style={({ isActive }) => (isActive ? { color: 'red' } : {})}>
                    Create Nft
                </NavLink>
                <NavLink to='/login' style={({ isActive }) => (isActive ? { color: 'red' } : {})}>  
                    Login
                </NavLink>
                <button onClick={handleLogOut}>Logout</button>
            </nav>
            <Outlet />
        </header>
    )
}

const Router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        children: [
            {
                index: true,
                element: <Homepage />,
            },
            {
                path: "homepage",
                element: <Homepage />,
            },
            {
                path: "profile",
                element: <Profile />,
            },
            {
                path: "createNft",
                element: <CreateNft />,
            },
            {
                path: "login",
                element: <Login />,
            },
            {
                path: "createAccount",
                element: <CreateAccount />,
            },
            {
                path: "nft/:id",
                element: <Nft />,
                loader: async ({params}) => {
                    const id = params.id;
                    return id;
                },  
            },
            {
                path: "profilenft",
                element: <ProfileNft />,
            },
            {
                path: "biding/:id",
                element: <Biding />,
                loader: async ({params}) => {
                    const id = params.id;
                    return id;
                },  
            }
        ],
    },
]);

export default Router;