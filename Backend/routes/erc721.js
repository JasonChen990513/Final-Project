const { Router } = require("express");
const { appendToDB } = require("../controller/createToken");

const erc721Router = Router();

erc721Router.post("/addmetadata", async (req, res) => {
    const { name, description, mintTo, image, tokenId } = req.body;

    await appendToDB(name, description, mintTo, image, tokenId);
    res.json({ message: "Token created successfully" });
});

module.exports = {erc721Router};


