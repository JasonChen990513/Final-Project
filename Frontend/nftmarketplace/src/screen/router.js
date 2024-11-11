import { createBrowserRouter,NavLink, Outlet  } from "react-router-dom";
import '../index.css';
import { useActionsCreator } from "../hook/useActionsCreator";
import { useNavigate } from 'react-router-dom';
import CreateNft from "./createNft";
import Homepage from "./homepage";
import Nft from "./nft";
import Profile from "./profile";



export const Root = () => {
    const { UserLogout } = useActionsCreator();
    const navigate = useNavigate();

    const handleLogOut = () => {
		UserLogout();
		navigate('/login');
	};

    return (
        <header>
            <nav>
                <NavLink to='/homepage' style={({ isActive }) => (isActive ? { color: 'red' } : {})}>
                    Home
                </NavLink>
                <NavLink to='/profile' style={({ isActive }) => (isActive ? { color: 'red' } : {})}>
                    Profile
                </NavLink>
                <NavLink to='/nft' style={({ isActive }) => (isActive ? { color: 'red' } : {})}>
                    Nft
                </NavLink>
                <NavLink to='/createNft' style={({ isActive }) => (isActive ? { color: 'red' } : {})}>
                    Create Nft
                </NavLink>
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
                path: "nft/:id",
                element: <Nft />,
                loader: async ({params}) => {
                    const id = params.id;
                    return id;
                },  
            },
        ],
    },
]);

export default Router;