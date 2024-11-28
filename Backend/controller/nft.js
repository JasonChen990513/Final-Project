const { NFTInfo } = require('../model/model');
const { User } = require('../model/model');
const { TransactionHistory } = require('../model/model');
const { NFT1155 } = require('../model/model');


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

//display user's 721 nft
const getUser721NFT = async (req, res) => {
    try {
        const id = req.id;
        console.log(id);
        const user = await User.findOne({ _id: id });
        console.log(user);
        const results = await NFTInfo.find({ owner: user.address });
        console.log(results);
        return res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

//get usre 1155 nft
const getUser1155NFT = async (req, res) => {
  const { nftId } = req.query;
  //console.log(nftId);
  
  const nft = await NFT1155.findOne({ tokenId: nftId });
  
  if (!nft) {
    throw new Error('NFT not found');
  }
  
  res.status(200).json(nft);
}

//display user's buy and sell history
const getUserHistory = async (req, res) => {
    try {
      console.log('inside get user history');
        const userId = req.id;
        console.log(userId);
        const user = await User.findOne({ _id: userId });
        const results = await TransactionHistory.find({
          $or: [
            { seller: new RegExp(`^${user.address}$`, 'i') }, // Case-insensitive regex
            { buyer: new RegExp(`^${user.address}$`, 'i') }
        ]
        });
        console.log('history results');
        console.log(results.length);
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
        //console.log(results);
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

const sell = async (req, res) => {
  const { tokenId, price } = req.body;
  console.log(tokenId);
  console.log(price);
  const nftinfo = await NFTInfo.findOne({ tokenId: tokenId });
  // update the selling price and status
  nftinfo.price = price;
  nftinfo.sellStatus = true;

  await nftinfo.save();
  
  res.json({ message: 'NFT place to sell successfully' });
}

const buy = async (req, res) => {
  const { nftAddress, tokenId, seller, buyer, price, amount } = req.body;
  const nftinfo = await NFTInfo.findOne({ tokenId: tokenId });

  if(nftAddress === "0x33AFe777f3eF363615417C2f5488486BB5cC4400"){
    //change the owner
    nftinfo.owner = buyer;

    // update the selling status
    nftinfo.sellStatus = false;
    await nftinfo.save();
  }
  
  //generate history
  const history = new TransactionHistory({
      nftAddress: nftAddress,
      tokenId: tokenId,
      seller: seller,
      buyer: buyer,
      price: price,
      amount: amount
  });
  
  await history.save();
  res.json({ message: 'NFT buy successfully' });
}



module.exports = { getReadyToSell, getUser721NFT,getUser1155NFT, getUserHistory, getNFTDetails, updateSellingStatus, sell, buy };
