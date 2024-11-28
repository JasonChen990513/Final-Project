import { useLoaderData  } from "react-router-dom";
import { connectWallet,  getContract } from "../util/contract";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { getERC20Contract, CONTRACT_ADDRESS } from "../util/contract";

const Biding = () => {
    const id = useLoaderData();
    const [nft, setNft] = useState({});
    const [bidPrice, setBidPrice] = useState(0);
    
    //console.log(id);
    useEffect(() => {
        const getNftinfo = async () => {
            const { account, signer } = await connectWallet();
            const contract = await getContract(signer);
            const nft = await contract.auctions(id);
            console.log(nft);
            if(nft.id !== 0){
                setNft(nft);
                
            }
        }

        getNftinfo();
    }, []);

    const handlebid = async () => {
        
        const { account, signer } = await connectWallet();
        const contract = await getContract(signer);
        const erc20 = await getERC20Contract(signer);

        console.log('Approving tokens...');
        const approveTx = await erc20.approve(CONTRACT_ADDRESS, nft.price);
        await approveTx.wait(); // Wait for the approval transaction to be mined
        console.log('Tokens approved.');

        console.log('Biding NFT...');
        const buyTx = await contract.placeBid(nft.id, ethers.parseEther(bidPrice));
        await buyTx.wait(); // Wait for the buying transaction to be mined
        console.log('Biding success!');

    }

    const formattedPrice = nft?.price ? ethers.formatEther(nft.price) : "Loading...";
    
    return (
        <div>
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full">
                    <img
                        src={nft.image}
                        alt={nft.name}
                        className="w-full h-64 object-cover rounded-t-lg"
                    />
                    <div className="p-4">
                        <div className="flex justify-between items-center">
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">{nft.name}</h1>
                            <p className="text-2xl text-gray-800 mb-2">ID: {(nft?.id)?.toString()}</p>
                        </div>  
                        
                        <p className="text-gray-600 mb-4">{nft.description}</p>
                        <p className="text-gray-600 mb-4">Seller: {nft.seller}</p>
                        <p className="text-gray-600 mb-4">Price: {formattedPrice} FTP</p>
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-gray-700">Amount:</span>
                            <span className="text-xl font-bold text-gray-900">{(nft?.amount)?.toString()}</span>
                        </div>
                        <button 
                            
                            className={`mt-6 w-full text-white font-bold py-2 px-4 rounded ${
                                nft.sellStatus ? 'bg-blue-500 hover:bg-blue-600 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'
                            }`}
                            disabled={nft.sellingstatus}
                            onClick={handlebid}
                            >
                            Bid
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Biding;