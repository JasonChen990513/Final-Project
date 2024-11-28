const { Router } = require("express");
const { getUser1155NFT, getUser721NFT, buy, sell, getUserHistory } = require("../controller/nft");
const { auth } = require("../middleware/middleware");
const multer = require('multer');

// Set up multer to parse `multipart/form-data`
const upload = multer();

const nftRouter = Router();

nftRouter
    .get("/getuser721", auth, getUser721NFT)
    .get("/get1155", upload.none(), auth, getUser1155NFT)
    .post("/buy", upload.none(), auth, buy)
    .post("/sell", upload.none(), auth, sell)
    .get("/getuserhistory", auth, getUserHistory);


module.exports = { nftRouter };