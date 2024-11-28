const { date } = require('joi');
const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    nftAddress: {
        type: String,
        required: true
    },
    tokenId: {
        type: String,
        required: true
    },
    seller: {
        type: String,
        required: true
    },
    minBid: {
        type: String,
        required: true
    },
    endTime: {
        type: Number,
        required: true
    },
    highestBid: {
        type: String,
        required: true
    },
    isActive: 
    {
        type: Boolean,
        default: true
    }
});

const userSchema = new mongoose.Schema(
    {
        address: {
            type: String,
            required: true
        },

        name: {
            type: String,
            trim: true,
            required: true
        },

        password: {
            type: String,
            required: true
        },
    },
    {
        timestamps: true
    }
)

const transactionHistorySchema = new mongoose.Schema({
    nftAddress: {
        type: String,
        required: true
    },
    tokenId: {
        type: String,
        required: true
    },
    seller: {
        type: String,
        required: true
    },
    buyer: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    amount: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const nft1155Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    tokenId: {
        type: String,
        required: true
    },
});


const nftInfoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    nftAddress: {
        type: String,
        required: true
    },
    tokenId: {
        type: String,
        required: true
    },
    owner: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    sellStatus: {
        type: Boolean,
        default: false
    },
    sellType: {
        type: String,
        required: true
    },
});




const User = mongoose.model('User', userSchema);
const Auction = mongoose.model('Auction', auctionSchema);
const TransactionHistory = mongoose.model('TransactionHistory', transactionHistorySchema);
const NFTInfo = mongoose.model('NFTInfo', nftInfoSchema);
const NFT1155 = mongoose.model('ERC1155', nft1155Schema);

module.exports = { User, Auction, TransactionHistory, NFTInfo, NFT1155 };
