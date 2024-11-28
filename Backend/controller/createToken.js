const env = require('dotenv');
env.config();

const { Metadata } = require('../model/model');
const { NFTInfo } = require('../model/model');
const { User } = require('../model/model');
const { ethers } = require('ethers');
const FormData = require('form-data');
const axios = require('axios');


// Configure provider and wallet
// const provider = new ethers.JsonRpcProvider('https://node1.maalscan.io');
// const privateKey = '.......PK';
// const wallet = new ethers.Wallet(privateKey, provider);

// Smart contract details
// const erc721ContractAddress = 'contract address';
// const erc1155ContractAddress = 'contract address';

//const erc721contract = new ethers.Contract(contractAddress, erc721ContractABI, wallet);


const createERC721Token = async (req, res) => {
    const name = req.body.name;
    const description = req.body.description;
    const image = req.file;

    console.log('this is info from front end');
    console.log(name);
    console.log(description);
    console.log(image);
    console.log('this is info from front end');

    //upload image file
    const image_cid = await uploadImageToPinata(name, image);
    console.log('this is image cid: '+image_cid);


    //upload json file
    const json_cid = await uploadJsonToPinata(name, description, image_cid);
    console.log('this is json cid: '+json_cid);

    //create the token
    //createNFT(mintTo, json_cid);
    //appendToDB(name, description, image_cid, 1);

    res.json({ message: 'Token created success fully',
        data:{ json_cid: 'https://gateway.pinata.cloud/ipfs/'+json_cid,
            image_cid: 'https://ipfs.io/ipfs/'+image_cid
        }
     });
}



const uploadImageToPinata = async (name ,image) => {
    
    const formData = new FormData();

    formData.append('file', image.buffer, {
        filename: name, // Set the original file name
        contentType: image.mimetype   // Set the MIME type (e.g., image/jpeg)
    });
    formData.append('pinataOptions','{"cidVersion": 1}');
 
    const metadate = JSON.stringify({
        name: name,
        keyvalues: {
            decription: `This is the ${name} image`
        }
    })
    formData.append('pinataMetadata',metadate);

    try {
        const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
            maxBodyLength: 'Infinity',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                'Authorization': `Bearer ${process.env.PINATAJWT}`,
            }
        })
    
        console.log('Upload image success!')
        return response.data.IpfsHash;
    } catch (error) {
        console.log(error)
    }
}

const uploadJsonToPinata = async (name, description, image_cid) => {
    console.log('starting upoladJson to Pinata')

    const formDataJson = new FormData();
   
    const metadate = JSON.stringify({
        name: name,
        keyvalues: {
            decription: description,
        }
    })
    //ipfs://
    //image: `https://pink-bitter-tarsier-946.mypinata.cloud/ipfs/${image_cid}`
    const jsonFile = JSON.stringify({
      name: name,
      description: description,
      image: `https://ipfs.io/ipfs/${image_cid}`
    }, null, 2);

    formDataJson.append('file', jsonFile, `${name}.json`);
    formDataJson.append('pinataOptions','{"cidVersion": 1}');
    formDataJson.append('pinataMetadata', metadate);
    console.log('form data setup finish')

    try {
        const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formDataJson, {
            maxBodyLength: 'Infinity',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${formDataJson._boundary}`,
                'Authorization': `Bearer ${process.env.PINATAJWT}`
            }
          })
          //add file to database
          console.log('Upload json file success!')
          return res.data.IpfsHash;
    } catch (error) {
        console.log(error)
    }


}
//https://node1.maalscan.io
const createNFT = async (mintTo, json_cid) => {
    // Connect to the Ethereum network
    const provider = new ethers.JsonRpcProvider(process.env.MAAL_URL);

    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);

    try {
        console.log('call contract mintNFT')
        await contract.mintNFT(mintTo, `ipfs://${json_cid}`)
        console.log('Success')
      } catch (error) {
        console.error('Error:', error);
      }
}

const appendToDB = async (req, res) => {
    const { name, description, image, tokenId, nftAddress } = req.body;

    console.log(name);
    console.log(description);
    console.log(image);
    console.log(tokenId);

    console.log('starting store the nft info')
    console.log('get user id');
    const id = req.id;
    console.log(id);
    console.log('get user address');
    const user = await User.findOne({_id: id});
    const address = user.address; 
    console.log(address);  
    

    let nftInfo = new NFTInfo({
        name: name,
        description: description,
        image: image,
        nftAddress: nftAddress,
        tokenId: tokenId,
        owner: address,
        price: 0,
        sellStatus: false,
        sellType: 'fix or auction'
    })

    await nftInfo.save();

    res.json({ message: 'Token created successfully' });  
};


module.exports = { appendToDB, createERC721Token };