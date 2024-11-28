import AuthUser from "../hook/authUser";
import { useNavigate } from "react-router-dom";
import { UserLogout } from "../store/userSlice";
import { useEffect, useState } from "react";
import { connectWallet, getContract } from "../util/contract";
import { ethers } from "ethers";

const Homepage = () => {
    const navigate = useNavigate();

    //display all the nfts which ready to sell
    const [nfts, setNfts] = useState([]);
    const [auctions, setAuctions] = useState([]);

    useEffect(() => {
        const fetchNFTs = async () => {
            try {
                const { account, signer } = await connectWallet();
                const contract = await getContract(signer);
                const listCount = await contract.listIdCount();
                const auctionCount = await contract.auctionCount();
                console.log('auctionCount', auctionCount);
                const auctions = [];
                for(let i = 0; i < auctionCount; i++) {
                    const auction = await contract.auctions(i + 1);
                    let auctionobj = {
                        nftAddress: auction.nftAddress,
                        tokenId: auction.tokenId,
                        seller: auction.seller,
                        amount: auction.amount,
                        minBid: auction.minBid,
                        highestBid: auction.highestBid,
                        highestBidder: auction.highestBidder,
                        endTime: auction.endTime,
                        isActive: auction.isActive,
                        id: i + 1
                    };
                    console.log(auctionobj);
                    if(auction.isActive === true){
                        auctions.push(auctionobj);
                    }
                }
                const nfts = [];
                for(let i = 0; i < listCount; i++) {
                    const nft = await contract.productslist(i + 1);
                    if(nft.sellStatus === true){
                        nfts.push(nft);
                    }
                }
                setNfts(nfts);
                setAuctions(auctions);
            } catch (error) {
                console.error('Error fetching NFTs:', error);
            }
        };

        fetchNFTs();
    }, []);

    const gotoDetail = (id) => {
        navigate(`/nft/${id}`);
    };

    const gotoBiding = (id) => {
        navigate(`/biding/${id}`);
    };


    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6 text-center">NFT Marketplace</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {nfts.map((nft) => (
                    <div key={nft.id} 
                        onClick={() => gotoDetail(nft.id)} 
                        className="border rounded-lg overflow-hidden shadow-lg">
                        <img
                            src={nft.image}
                            alt={nft.name}
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                            <h2 className="text-lg font-semibold">{nft.name}</h2>
                            <p className="text-gray-500">{nft.description}</p>
                            <div className="mt-4">
                                <span className="text-green-600 font-bold">{ethers.formatEther(nft.price)} Maal</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <h1 className="text-3xl font-bold mb-6 text-center">NFT Auction</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {auctions.map((nft) => (
                    <div key={nft.id} 
                        onClick={() => gotoBiding(nft.id)} 
                        className="border rounded-lg overflow-hidden shadow-lg">
                        <img
                            src={nft.image}
                            alt={nft.name}
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                            <h2 className="text-lg font-semibold">{nft.name}</h2>
                            <p className="text-gray-500">{nft.description}</p>
                            {/* <div className="mt-4">
                                <span className="text-green-600 font-bold">{ethers.formatEther(nft.price)} Maal</span>
                            </div> */}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AuthUser(Homepage);