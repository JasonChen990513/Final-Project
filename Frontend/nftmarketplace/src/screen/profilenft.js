import { erc721Address, erc1155Address } from "../util/contract";
import { connectWallet, getContract, getERC721Contract, getERC1155Contract, CONTRACT_ADDRESS} from "../util/contract";
import { ethers } from "ethers";
import axios from "axios";
import { useEffect, useState } from "react";


const ProfileNft = () => {
    const {tokenId, name, image, description, amount} = JSON.parse(localStorage.getItem('nftinfo'));
    console.log(tokenId, name, image, description, amount);
    const is721 = (amount === undefined);
    console.log(is721);
    const nftAddress = is721 ?  erc721Address : erc1155Address;
    console.log(nftAddress);
    const [price, setPrice] = useState(0);
    const [sellAmount, setSellAmount] = useState(0);
    const [minbid, setMinbid] = useState(0);
    const [duration, setDuration] = useState(0);
    const [bidAmount, setBidAmount] = useState(0);

    const handlePlaceToSell721 = async () => {
        const { signer } = await connectWallet();
        const contract = await getContract(signer);
        const erc721contract = await getERC721Contract(signer);

        console.log('Approving NFT721...');
        const approveTx = await erc721contract.approve(CONTRACT_ADDRESS, tokenId);
        await approveTx.wait(); // Wait for the approval transaction to be mined
        console.log('NFT approved.');


        console.log('Placing NFT to sell...');
        const sellTx = await contract.placetoSell(
            erc721Address, 
            tokenId, 
            ethers.parseEther((price).toString()), 
            name, 
            description, 
            image, 
            1
        );
        await sellTx.wait(); // Wait for the selling transaction to be mined
        console.log('place to sell success in contract');

        //set the status in nft info

        try {
            const formData = new FormData();
            formData.append('tokenId', tokenId);
            formData.append('price', price);
            const response = await axios.post('http://localhost:5000/api/v1/nft/sell', formData, {
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                },
            });
    
            console.log(response);
        } catch (error) {
            console.log(error);
        }
    }

    const handlePlaceToSell1155 = async () => {
        const { signer } = await connectWallet();
        const contract = await getContract(signer);
        const erc1155contract = await getERC1155Contract(signer);

        console.log('Approving NFT 1155...');
        const approveTx = await erc1155contract.setApprovalForAll(CONTRACT_ADDRESS, true);
        await approveTx.wait(); // Wait for the approval transaction to be mined
        console.log('NFT approved.');


        console.log('Placing NFT to sell...');
        const sellTx = await contract.placetoSell(
            erc1155Address, 
            tokenId, 
            ethers.parseEther((price).toString()), 
            name, 
            description, 
            image, 
            sellAmount
        );
        await sellTx.wait(); // Wait for the selling transaction to be mined
        console.log('place to sell success in contract');

    }

    const handleBid721 = async () => {
        const { signer } = await connectWallet();
        const contract = await getContract(signer);
        const erc721contract = await getERC721Contract(signer);

        console.log('Approving NFT721 for bid...');
        const approveTx = await erc721contract.approve(CONTRACT_ADDRESS, tokenId);
        await approveTx.wait(); // Wait for the approval transaction to be mined
        console.log('NFT approved.');


        console.log('Placing NFT to bid...');
        const sellTx = await contract.createAuction(
            erc721Address, 
            tokenId, 
            ethers.parseEther((minbid).toString()), 
            duration
        );    
        await sellTx.wait(); // Wait for the selling transaction to be mined
        console.log('place to bid success in contract');
    }

    const handleBid1155 = async () => {
        const { signer } = await connectWallet();
        const contract = await getContract(signer);
        const erc1155contract = await getERC1155Contract(signer);

        console.log('Approving NFT1155 for bid...');
        const approveTx = await erc1155contract.setApprovalForAll(CONTRACT_ADDRESS, true);
        await approveTx.wait(); // Wait for the approval transaction to be mined
        console.log('NFT approved.');


        console.log('Placing NFT to bid...');
        const sellTx = await contract.createAuction(
            erc1155Address, 
            tokenId, 
            ethers.parseEther((minbid).toString()), 
            duration,
            bidAmount
        );    
        await sellTx.wait(); // Wait for the selling transaction to be mined
        console.log('place to bid success in contract');
    }

    const handleSell = async () => {
        if(is721) {
            handlePlaceToSell721();
        }
        else {
            handlePlaceToSell1155();
        }
    }

    const handleBid = async () => {
        if(is721) {
            handleBid721();
        }
        else {
            handleBid1155();
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white shadow-lg rounded-lg p-6 m-6 max-w-md w-full">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-64 object-cover rounded-t-lg"
                />
                <div className="p-4">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">{name}</h1>
                    <p className="text-gray-600 mb-4">{description}</p>
                    { !is721 && <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-700">Amount:</span>
                        <span className="text-xl font-bold text-gray-900">{amount}</span>
                    </div>}
                    { !is721 && 
                    <div>
                        <div>Sell Amount</div>
                        <input type="number" placeholder="Amount" className="w-full border border-gray-300 rounded-md py-2 px-3 mt-4" value={sellAmount} onChange={(e) => setSellAmount(e.target.value)} />
                    </div>
                    } 
                    <div className="mt-2">Price</div>
                    <input type="number" placeholder="Price" className="w-full border border-gray-300 rounded-md py-2 px-3 mt-4" value={price} onChange={(e) => setPrice(e.target.value)} />
                    <button className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                        onClick={handleSell}>
                        Sell
                    </button>

                    <div>
                        <div>Create Auction</div>
                        <div>Minimum Bid</div>
                        <input type="number" placeholder="Minimum Bid" className="w-full border border-gray-300 rounded-md py-2 px-3 mt-4" value={minbid} onChange={(e) => setMinbid(e.target.value)} />
                        <div>Duration (sec)</div>
                        <input type="number" placeholder="Duration" className="w-full border border-gray-300 rounded-md py-2 px-3 mt-4" value={duration} onChange={(e) => setDuration(e.target.value)} />
                        <div>Bid Amount</div>
                        <input type="number" placeholder="Bid Amount" className="w-full border border-gray-300 rounded-md py-2 px-3 mt-4" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} />
                        <button 
                            onClick={handleBid} className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                            Create Auction    
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfileNft;