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
    metadata: metadataSchema,
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
        email: {
            type: String,
            required: true
        },

        firstName: {
            type: String,
            trim: true,
            default: ""
        },

        lastName: {
            type: String,
            trim: true,
            default: ""
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
    date: {
        type: Date,
        required: true
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
    }
});


const User = mongoose.model('User', userSchema);
const Metadata = mongoose.model('Metadata', metadataSchema);
const Auction = mongoose.model('Like', auctionSchema);
const TransactionHistory = mongoose.model('TransactionHistory', transactionHistorySchema);
const NFTInfo = mongoose.model('NFTInfo', nftInfoSchema);

module.exports = { User, Metadata, Auction };
