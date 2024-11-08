const { NFTInfo } = require('../model/model');
const { User } = require('../model/model');
const { TransactionHistory } = require('../model/model');



//display all ready to sell
const getReadyToSell = async (req, res) => {
    try {
        const results = await NFTInfo.find({ sellStatus: true });
        console.log(results);
        return res.status(200).json(results);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
}

//display user's nft
const getUserNFT = async (req, res) => {
    try {
        const { id } = req.body;
        const user = await User.findOne({ _id: id });
        const results = await NFTInfo.find({ owner: user.address });
        console.log(results);
        return res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

//display user's buy and sell history
const getUserHistory = async (req, res) => {
    try {
        const userId = req.id;
        const results = await TransactionHistory.find({
          $or: [
            { seller: userId },
            { buyer: userId }
          ]
        });
        console.log(results);
        return res.status(200).json(results);
      } catch (error) {
        console.error('Error fetching transaction history:', error);
      }
}

//display nft details
const getNFTDetails = async (req, res) => {
    try {
        const { id } = req.body;
        const results = await NFTInfo.findOne({ _id: id });
        console.log(results);
        return res.status(200).json(results);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
}

//update selling status
const updateSellingStatus = async (req, res) => {
  try {
    // Find the NFT by its ID and toggle the sellStatus
    const nft = await NFTInfo.findById(nftId);
    
    if (!nft) {
      throw new Error('NFT not found');
    }
    
    // Toggle the sellStatus
    nft.sellStatus = !nft.sellStatus;
    
    // Save the updated document
    const updatedNFT = await nft.save();
    console.log('Sell status updated successfully:', updatedNFT);
    return res.status(200).json(`The NFT sell status change to ${updatedNFT.sellStatus}`);
  } catch (error) {
    console.error('Error toggling sell status:', error);
    throw error;
  }
}

