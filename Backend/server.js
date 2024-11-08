const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { erc721Router } = require("./routes/erc721");

const { connectDB } = require("./connectToDB");
const { ethers } = require("ethers");

const { contractABI } = require("./abi");

dotenv.config();
const PORT = process.env.PORT || 5000;
const DB_URL = process.env.DB_URL;
const app = express();

connectDB(DB_URL);
//enable cors
app.use(cors());

// create buy and sell
app.use('/api/v1/erc721', erc721Router);

// Configure provider and wallet
const provider = new ethers.JsonRpcProvider('https://node1.maalscan.io');
const privateKey = '.......PK';
const wallet = new ethers.Wallet(privateKey, provider);

// Smart contract details
const contractAddress = 'contract address';

const auctionContract = new ethers.Contract(contractAddress, contractABI, wallet);

// Place a bid endpoint
app.post('/placeBid', async (req, res) => {
    const { auctionId, bidAmount } = req.body;

    try {
        const tx = await auctionContract.placeBid(auctionId, {
            value: ethers.utils.parseEther(bidAmount)
        });
        await tx.wait();

        res.json({ message: 'Bid placed successfully', transactionHash: tx.hash });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Check and finalize auctions automatically
async function checkAuctions() {
    const auctionCount = await auctionContract.auctionCount();

    for (let i = 1; i <= auctionCount; i++) {
        const auction = await auctionContract.auctions(i);

        if (auction.isActive && auction.endTime < Math.floor(Date.now() / 1000)) {
            try {
                const tx = await auctionContract.finalizeAuction(i);
                await tx.wait();
                console.log(`Auction ${i} finalized successfully`);
            } catch (error) {
                console.error(`Error finalizing auction ${i}:`, error);
            }
        }
    }
}

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));