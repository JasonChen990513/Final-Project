const { Router } = require("express");
const { appendToDB, createERC721Token } = require("../controller/createToken");
const { auth } = require("../middleware/middleware");
const multer = require('multer');
const memoryStorage = multer.memoryStorage(); // Store files in memory instead of disk
const memoryUpload = multer({ storage: memoryStorage });

const erc721Router = Router();

// erc721Router.post("/addmetadata", async (req, res) => {
//     const { name, description, owner, image, tokenId } = req.body;

//     await appendToDB(name, description, owner, image, tokenId);
//     res.json({ message: "Token created successfully" });
// });
erc721Router
    .post("/addmetadata", auth, memoryUpload.none(),appendToDB)
    .post("/createNFT", auth,  memoryUpload.single('image') ,createERC721Token);

module.exports = {erc721Router};


