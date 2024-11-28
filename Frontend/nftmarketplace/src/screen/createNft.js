import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getERC721Contract, connectWallet } from "../util/contract";


const CreateNft = () => {
    //get the name decription and image 
    //create the nft

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const nft721address = '0x33AFe777f3eF363615417C2f5488486BB5cC4400';
    //const [userAddress, setUserAddress] = useState('');

    const navigate = useNavigate();

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        
        setImage(file);
        // Generate image preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageUrl(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const uploadtoServer = async() =>{
        axios.defaults.withCredentials = true;

        const formData = new FormData();
    
        //send data to local server
        formData.append('name', name);
        formData.append('description', description);
        formData.append('image', image);

        console.log(name);
        console.log(description);
        console.log(image);

        try {
          const response = await axios.post('http://localhost:5000/api/v1/erc721/createNFT', formData,{
            headers: {
                'Content-Type': `multipart/form-data; boundary=${formData._boundary}`, // Ensure the server knows you're sending form data
            },
          });
    
          const data = response.data;
          console.log(data.data.json_cid)
          console.log(data.data.image_cid)
          const json_cid = data.data.json_cid;
          //alert(data.data.json_cid + '\n' + data.data.image_cid);

          const { signer, account } = await connectWallet();
          const contract = await getERC721Contract(signer);
          console.log(json_cid);
          contract.mintNFT(account, json_cid)        
            .then(tx => {
            // Wait for the transaction to be mined
            return tx.wait();
            })
            .then(async() => {
                console.log('create nft successful');
                //add the nft to the database
                console.log('get token id');
                const tokenId = await contract.currentTokenId();
                console.log(tokenId);
                console.log('get token id done');

                appendToDB(name, description, data.data.image_cid, tokenId);
                //navigate('/profile');
            })
            .catch(error => {
                    console.log(error)
            });

        } catch (error) {
          console.error('Error:', error);
        }
    }

    const appendToDB = async (name, description, image_cid, tokenId) => {
        try {
            console.log('push to db');
            //const { account } = await connectWallet();

            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('image', image_cid);
            formData.append('tokenId', tokenId);
            formData.append('nftAddress', nft721address);
            //formData.append('owner', account);

            const response = await axios.post('http://localhost:5000/api/v1/erc721/addmetadata', formData,{
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${formData._boundary}`, // Ensure the server knows you're sending form data
                },
              });

            console.log('push to db done');
            console.log(response);
            navigate('/profile');
        } catch (error) {
            console.error('Error:', error);
        }
    }


    return (
        <div>
            <h1>Create Nft</h1>   
            <section>
            <div>
                <div>name</div>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className='border border-black rounded-xl p-2' />
                </div>
                <div>
                    <div>description</div>
                    <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className='border border-black rounded-xl p-2' />
                </div>
                <div>
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                    {imageUrl && (
                        <div>
                            <h3>Uploaded Image:</h3>
                            <img src={ imageUrl} alt="Uploaded" style={{ width: '300px' }} />
                        </div>
                    )}
                </div>
   
                <button className='ml-10 border border-black rounded-xl w-fit px-3 py-2' onClick={uploadtoServer}>Create NFT</button>

            </section>         
        </div>
    )
}

export default CreateNft;