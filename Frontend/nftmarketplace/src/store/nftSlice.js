import { createSlice } from "@reduxjs/toolkit";

//use to store nft list form smart contract
export const nftSlice = createSlice({ 
    name: "nft",
    initialState: {
        nft: [],
    },
    reducers: {
        setNFT: (state, action) => {
            state.nft = action.payload;
        },
    },
}); 

export const { setNFT } = nftSlice.actions;
export default nftSlice.reducer;