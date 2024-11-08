const { date } = require('joi');
const mongoose = require('mongoose');

const metadataSchema = new mongoose.Schema({
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
    }
});

const auctionSchema = new mongoose.Schema({

    metadata: {
        type:  mongoose.Schema.ObjectId,
        ref: 'Metadata',
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
        type:  mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    buyer: {
        type:  mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    price: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});


const nftInfoSchema = new mongoose.Schema({
    nftMatadata: {
        type:  mongoose.Schema.ObjectId,
        ref: 'Metadata',
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
    }
});


const User = mongoose.model('User', userSchema);
const Metadata = mongoose.model('Metadata', metadataSchema);
const Auction = mongoose.model('Like', auctionSchema);
const TransactionHistory = mongoose.model('TransactionHistory', transactionHistorySchema);
const NFTInfo = mongoose.model('NFTInfo', nftInfoSchema);

module.exports = { User, Metadata, Auction, TransactionHistory, NFTInfo };
