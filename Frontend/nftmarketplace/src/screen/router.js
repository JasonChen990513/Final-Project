import { createBrowserRouter,NavLink, Outlet  } from "react-router-dom";
import '../index.css';
import { useActionsCreator } from "../hook/useActionsCreator";
import { useNavigate } from 'react-router-dom';
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