const env = require('dotenv');
env.config();

const { NFTInfo } = require('../model/model');


const sellNFT = async (tokenId, price) => {
    const nftinfo = await NFTInfo.findOne({ tokenId: tokenId });
    // update the selling price and status
    nftinfo.price = price;
    nftinfo.sellStatus = true;

    await nftinfo.save();
}

const buyNFT = async (tokenId, buyer) => {
    const nftinfo = await NFTInfo.findOne({ tokenId: tokenId });
    const seller = nftinfo.owner;

    // update the selling status
    nftinfo.sellStatus = false;


    await nftinfo.save();

    //generate history
    const history = new TransactionHistory({
        nftAddress: '0x0000000000000000000000000000000000000000',
        tokenId: tokenId,
        seller: seller,
        buyer: buyer,
        price: nftinfo.price
    });

    await history.save();

}


module.exports = { sellNFT, buyNFT }