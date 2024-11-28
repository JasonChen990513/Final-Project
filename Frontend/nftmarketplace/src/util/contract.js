import { ethers } from "ethers";
import { ERC721ABI, ERC1155ABI, ERC20ABI, contractABI } from "./abi";

//set abi and contract
export const CONTRACT_ADDRESS = '0x5314273c5573046A5263Da9Dae83eC822075f94c';
export const erc721Address = '0x33AFe777f3eF363615417C2f5488486BB5cC4400';
export const erc1155Address = '0x998C87E3735056dA1a667c8a3843803061a760f3';
export const erc20Address = '0xE94AEF0234b3cDA3201a5b82852a522fee1513c8';

export const connectProvider = () =>{
    const provider = new ethers.BrowserProvider(window.ethereum);
    return{provider}
}


export const connectWallet = async() =>{

    let account = '';
    const provider = new ethers.BrowserProvider(window.ethereum)
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    account = accounts?.length > 0 ? accounts[0] : '';
    const signer = await provider?.getSigner();
    
    return{account, signer ,provider}
}

export const getContract = (signer) =>{
    return new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
}

export const getERC721Contract = (signer) => {
    return new ethers.Contract(erc721Address, ERC721ABI, signer);
}

export const getERC1155Contract = (signer) => {
    return new ethers.Contract(erc1155Address, ERC1155ABI, signer);
}

export const getERC20Contract = (signer) => {
    return new ethers.Contract(erc20Address, ERC20ABI, signer);
}