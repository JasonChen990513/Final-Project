import axios from "axios";
import { ethers } from "ethers";
import { connectWallet, getContract, getERC721Contract, getERC20Contract, erc721Address, erc20Address, CONTRACT_ADDRESS, erc1155Address, getERC1155Contract } from "../util/contract";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../util/constant";


const Profile = () => {
    
    const [username, setUsername] = useState('');
    const [userAddress, setUserAddress] = useState('');
    const [user721NftList, setUser721NftList] = useState([]);
    const [user1155NftList, setUser1155NftList] = useState([]);
    const [transactions, setTransactions] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const get1155balance = async () => {
            const { account, signer } = await connectWallet();
            const contract = await getERC1155Contract(signer);
            const balance = await contract.balanceOfBatch([account,account,account], [0, 1, 2]);
            //console.log(balance);
    
            const nftList = [];
    
            for( let i = 0; i < balance.length; i++) {
                try {
                    if(balance[i] > 0) {
                        const response = await axios.get(serverUrl + `/api/v1/nft/get1155?nftId=${i}`);
                        const nft = response.data;
                        //console.log(nft);
                        const currentBalance = balance[i];
                        const nft1155info = {
                            id: i,
                            name: nft.name,
                            description: nft.description,
                            image: nft.image,
                            balance: currentBalance
                        }

                        nftList.push(nft1155info);
                    }

                } catch (error) {
                    console.log(error);
                }
    
            }
            setUser1155NftList(nftList); 
            
        }
    
        const initPage = async () => {
            const userData = await handleConnect();
            const user721Data = await handleGetNFT721();
            setUsername(userData.data.data.name);
            setUserAddress(userData.data.data.address);
            setUser721NftList(user721Data.data);
            //console.log(user721Data.data);
            

        }
        const fetchTransactions = async () => {
            try {
                const response = await axios.get(serverUrl + "/api/v1/nft/getuserhistory"); // Replace with your API endpoint
                console.log(response.data);
                setTransactions(response.data);
            } catch (error) {
                console.error("Error fetching transaction history:", error);
            }
        };

        
        initPage();
        get1155balance();
        fetchTransactions();
    }, []);

    //get and display the user name
    //get and display the user address
    //get and display the user nfts

    const handleConnect = async () => {
        axios.defaults.withCredentials = true;

        try {
            const response = await axios.get(serverUrl + '/api/v1/user/getuser', {
            });
    
            console.log(response);
            // console.log(response.data?.data?.token);
            return response;
        } catch (error) {
            alert(error.response.data.message);
        }
    }

    const handleGetNFT721 = async () => {
        axios.defaults.withCredentials = true;

        try {
            const response = await axios.get(serverUrl + '/api/v1/nft/getuser721', {
            });
    
            console.log(response);
            // console.log(response.data?.data?.token);
            return response;
        } catch (error) {
            alert(error.response.data.message);
        }
    }

    const handlePlaceToSell = async () => {
        const { signer } = await connectWallet();
        const contract = await getContract(signer);
        const erc721contract = await getERC721Contract(signer);

        // console.log('Approving NFT...');
        // const approveTx = await erc721contract.approve(CONTRACT_ADDRESS, 1);
        // await approveTx.wait(); // Wait for the approval transaction to be mined
        // console.log('NFT approved.');


        // console.log('Placing NFT to sell...');
        // const sellTx = await contract.placetoSell(
        //     erc721Address, 
        //     1, 
        //     ethers.parseEther("1"), 
        //     "space1", 
        //     "this is the space 1 image", 
        //     "https://ipfs.io/ipfs/bafkreicx2ucgfhwznhzljdeb5sqoeqifp7qpf4szf33buxvdtu3nt3yrdu", 
        //     1
        // );
        // await sellTx.wait(); // Wait for the selling transaction to be mined
        // console.log('place to sell success in contract');

        //set the status in nft info

        try {
            const formData = new FormData();
            formData.append('tokenId', 1);
            formData.append('price', 1);
            const response = await axios.post(serverUrl + '/api/v1/nft/sell', formData, {
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                },
            });
    
            console.log(response);
        } catch (error) {
            console.log(error);
        }
    }

    const handleBuy = async () => {
        const { account, signer } = await connectWallet();
        const contract = await getContract(signer);
        const erc20 = await getERC20Contract(signer);

        // console.log('Approving tokens...');
        // const approveTx = await erc20.approve(CONTRACT_ADDRESS, ethers.parseEther("1"));
        // await approveTx.wait(); // Wait for the approval transaction to be mined
        // console.log('Tokens approved.');

        // console.log('Buying NFT...');
        // const buyTx = await contract.buy(1);
        // await buyTx.wait(); // Wait for the buying transaction to be mined
        // console.log('Buy success!');

        //change the owner in nft info


        //get the transcation info and pass to db
        //get list info

        const listinfo = await contract.productslist(1);

        const formData = new FormData();
        formData.append('nftAddress', listinfo.nftAddress);
        formData.append('tokenId', listinfo.tokenId);
        formData.append('seller', listinfo.seller);
        formData.append('buyer', account);
        formData.append('price', ethers.formatEther(listinfo.price));

        try {
            const response = await axios.post(serverUrl + '/api/v1/nft/buy', formData, {
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${formData._boundary}`, // Ensure the server knows you're sending form data
                },
            });
    
            console.log(response);
        } catch (error) {
            alert(error.response.data.message);
        }
    }

    const reder721list = user721NftList?.map((item, index) => {
        
        return (
            <div key={index
            }
            onClick={() => gotoNftdetails(item.tokenId, item.name, item.image, item.description)} // Pass data to the handler
            className="cursor-pointer">
                <div key={item.id} className="border rounded-lg overflow-hidden shadow-lg">
                    <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                    <span className="text-black-600 font-bold">ID: {item.tokenId}</span>
                        <h2 className="text-lg font-semibold">{item.name}</h2>
                    </div>
                </div>
            </div>
        )
    })

    const gotoNftdetails = (tokenId, name, image, description, amount) => {
        console.log(tokenId, name, image, description, amount);
        localStorage.setItem('nftinfo', JSON.stringify({tokenId, name, image, description, amount}));
        navigate('/profilenft');
    }

    

    return (
        <div className=" flex flex-col gap-3 items-center">
            <h1>Profile</h1>
            <p>username: {username}</p>
            <p>user address: {userAddress}</p>
            <div>{reder721list}</div>

            <button onClick={handlePlaceToSell}> place to sell</button>
            <button onClick={handleBuy}> buy </button>
            {/* <button onClick={get1155balance}> get 1155 balance </button> */}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {user1155NftList.map((nft) => (
                    <div key={nft.id} className="border rounded-lg overflow-hidden shadow-lg cursor-pointer"
                    onClick={() => gotoNftdetails(nft.id, nft.name, nft.image, nft.description, (nft.balance).toString())} // Pass data to the handler
                    >
                        <img
                            src={nft.image}
                            alt={nft.name}
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                            <h2 className="text-lg font-semibold">{nft.name}</h2>
                            <p className="text-gray-500">{nft.description}</p>
                            <div className="mt-4 flex flex-between">
                                <span className="text-black-600 font-bold">Amount: {(nft.balance).toString()}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <h1 className="text-2xl font-bold mb-4">Transaction History</h1>
            <div className="overflow-x-auto">
                <table className="table-auto w-full border-collapse border border-gray-200">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-2">NFT Address</th>
                            <th className="border border-gray-300 px-4 py-2">Token ID</th>
                            <th className="border border-gray-300 px-4 py-2">Seller</th>
                            <th className="border border-gray-300 px-4 py-2">Buyer</th>
                            <th className="border border-gray-300 px-4 py-2">Price (ETH)</th>
                            <th className="border border-gray-300 px-4 py-2">Amount</th>
                            <th className="border border-gray-300 px-4 py-2">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((transaction, index) => (
                            <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                <td className="border border-gray-300 px-4 py-2">{transaction.nftAddress}</td>
                                <td className="border border-gray-300 px-4 py-2">{transaction.tokenId}</td>
                                <td className="border border-gray-300 px-4 py-2">{transaction.seller}</td>
                                <td className="border border-gray-300 px-4 py-2">{transaction.buyer}</td>
                                <td className="border border-gray-300 px-4 py-2">{transaction.price}</td>
                                <td className="border border-gray-300 px-4 py-2">{transaction.amount}</td>
                                <td className="border border-gray-300 px-4 py-2">
                                    {new Date(transaction.date).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Profile;