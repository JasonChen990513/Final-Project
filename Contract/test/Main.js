const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NftMarketPlace", function () {
    let nftMarketPlace, erc20Token, erc721Token, erc1155Token;
    let owner, seller, buyer, bidder;
    let tokenId = 1;
    let amount = 5;
    let minBid = ethers.parseEther("1");
    let duration = 60 * 60; // 1 hour

    beforeEach(async function () {
        [owner, seller, buyer, bidder] = await ethers.getSigners();

        // Deploy mock ERC20, ERC721, and ERC1155 tokens
        const MockERC20 = await ethers.getContractFactory("FinalProjectToken20");
        erc20Token = await MockERC20.deploy();
        await erc20Token.waitForDeployment();

        const MockERC721 = await ethers.getContractFactory("FinalProjectToken721");
        erc721Token = await MockERC721.deploy();
        await erc721Token.waitForDeployment();

        const MockERC1155 = await ethers.getContractFactory("FinalProjectToken1155");
        erc1155Token = await MockERC1155.deploy();
        await erc1155Token.waitForDeployment();

        // Deploy the NftMarketPlace contract
        const NftMarketPlace = await ethers.getContractFactory("NftMarketPlace");
        nftMarketPlace = await NftMarketPlace.deploy(
            await erc20Token.getAddress(),
            await erc721Token.getAddress(),
            await erc1155Token.getAddress()
        );
        await nftMarketPlace.waitForDeployment();

        // Mint tokens for testing
        await erc721Token.mintNFT(seller.address, "");
        await erc1155Token.mint(seller.address, tokenId, amount, "0x");
        await erc20Token.connect(owner).transfer(buyer.address, ethers.parseEther("10"));
        await erc20Token.connect(owner).transfer(bidder.address, ethers.parseEther("10"));
    });

    describe("ERC721 buy sell test" , function () {
      
      it("should place an ERC721 item for sale and allow a purchase", async function () {
        // Approve and list the ERC721 token
        await erc721Token.connect(seller).approve(await nftMarketPlace.getAddress(), tokenId);
        await nftMarketPlace.connect(seller).placetoSell(
            await erc721Token.getAddress(),
            tokenId,
            ethers.parseEther("2"),
            "NFT Item",
            "A unique NFT",
            "https://example.com/image",
            1
        );
        // Approve ERC20 token transfer and buy the ERC721 token
        await erc20Token.connect(buyer).approve(await nftMarketPlace.getAddress(), ethers.parseEther("2"));
        await nftMarketPlace.connect(buyer).buy(1);

        // Check new ownership of ERC721 token
        expect(await erc721Token.ownerOf(tokenId)).to.equal(buyer.address);
      });


    })

    describe("ERC1155 buy sell test" , function () {
      it("should place an ERC1155 item for sale and allow a purchase", async function () {
        // Approve and list the ERC1155 token
        await erc1155Token.connect(seller).setApprovalForAll(await nftMarketPlace.getAddress(), true);
        await nftMarketPlace.connect(seller).placetoSell(
            await erc1155Token.getAddress(),
            tokenId,
            ethers.parseEther("1"),
            "NFT Batch Item",
            "A batch of NFTs",
            "https://example.com/image",
            amount
        );

        // Approve ERC20 token transfer and buy the ERC1155 token
        await erc20Token.connect(buyer).approve(await nftMarketPlace.getAddress(), ethers.parseEther("1"));
        await nftMarketPlace.connect(buyer).buy(1);

        // Check new balance of ERC1155 token
        expect(await erc1155Token.balanceOf(buyer.address, tokenId)).to.equal(amount);
      });
    });

    describe("ERC721 auction test" , function () {
      
      it("should create an auction for ERC721, allow bids, and finalize auction", async function () {
        // Approve and create auction for ERC721 token
        await erc721Token.connect(seller).approve(await nftMarketPlace.getAddress(), tokenId);
        await nftMarketPlace.connect(seller).createAuction(
            await erc721Token.getAddress(),
            tokenId,
            minBid,
            duration,
            1
        );

        // Place bids
        await erc20Token.connect(bidder).approve(await nftMarketPlace.getAddress(), ethers.parseEther("2"));
        await nftMarketPlace.connect(bidder).placeBid(1, ethers.parseEther("2") );
        await erc20Token.connect(buyer).approve(await nftMarketPlace.getAddress(), ethers.parseEther("3"));
        await nftMarketPlace.connect(buyer).placeBid(1, ethers.parseEther("3") );

        // Advance time and finalize the auction
        await ethers.provider.send("evm_increaseTime", [duration + 1]);
        await nftMarketPlace.connect(seller).finalizeAuction(1);

        // Check final ownership
        expect(await erc721Token.ownerOf(tokenId)).to.equal(buyer.address);
      });
    });

    describe("ERC1155 auction test" , function () {
      it("should create an auction for ERC1155, allow bids, and finalize auction", async function () {
        // Approve and create auction for ERC1155 token
        await erc1155Token.connect(seller).setApprovalForAll(await nftMarketPlace.getAddress(), true);
        await nftMarketPlace.connect(seller).createAuction(
            await erc1155Token.getAddress(),
            tokenId,
            minBid,
            duration,
            amount
        );

        // Place bids
        await erc20Token.connect(bidder).approve(await nftMarketPlace.getAddress(), ethers.parseEther("2"));
        await nftMarketPlace.connect(bidder).placeBid(1, ethers.parseEther("2"));
        await erc20Token.connect(buyer).approve(await nftMarketPlace.getAddress(), ethers.parseEther("3"));
        await nftMarketPlace.connect(buyer).placeBid(1, ethers.parseEther("3"));

        // Advance time and finalize the auction
        await ethers.provider.send("evm_increaseTime", [duration + 1]);
        await nftMarketPlace.connect(seller).finalizeAuction(1);

        // Check final balance of ERC1155 token
        expect(await erc1155Token.balanceOf(buyer.address, tokenId)).to.equal(amount);
      });
    });


    describe("Cancel Sell Functionality", function () {
      it("should allow the seller to cancel an ERC721 sale", async function () {
          // Seller approves and lists the ERC721 token for sale
          await erc721Token.connect(seller).approve(await nftMarketPlace.getAddress(), tokenId);
          await nftMarketPlace.connect(seller).placetoSell(
              await erc721Token.getAddress(),
              tokenId,
              ethers.parseEther("1"),
              "NFT Item",
              "A unique NFT",
              "https://example.com/image",
              1
          );
  
          // Verify the product is listed for sale
          const productBeforeCancel = await nftMarketPlace.productslist(1);
          expect(productBeforeCancel.sellStatus).to.equal(true);
  
          // Cancel the sale
          await nftMarketPlace.connect(seller).cancelSell(1);
  
          // Verify the product is no longer for sale
          const productAfterCancel = await nftMarketPlace.productslist(1);
          expect(productAfterCancel.sellStatus).to.equal(false);
  
          // Verify that the seller has regained ownership of the ERC721 token
          const newOwner = await erc721Token.ownerOf(tokenId);
          expect(newOwner).to.equal(seller.address);
      });
  
      it("should allow the seller to cancel an ERC1155 sale", async function () {
          const amount = 5;
  
          // Seller approves and lists the ERC1155 token for sale
          await erc1155Token.connect(seller).setApprovalForAll(await nftMarketPlace.getAddress(), true);
          await nftMarketPlace.connect(seller).placetoSell(
              await erc1155Token.getAddress(),
              tokenId,
              ethers.parseEther("1"),
              "NFT Item",
              "A unique NFT",
              "https://example.com/image",
              amount
          );
  
          // Verify the product is listed for sale
          const productBeforeCancel = await nftMarketPlace.productslist(1);
          expect(productBeforeCancel.sellStatus).to.equal(true);
  
          // Cancel the sale
          await nftMarketPlace.connect(seller).cancelSell(1);
  
          // Verify the product is no longer for sale
          const productAfterCancel = await nftMarketPlace.productslist(1);
          expect(productAfterCancel.sellStatus).to.equal(false);
  
          // Verify that the seller has regained ownership of the ERC1155 token
          const sellerBalance = await erc1155Token.balanceOf(seller.address, tokenId);
          expect(sellerBalance).to.equal(amount);
      });
  
      it("should revert if a non-seller tries to cancel the sale", async function () {
          // Seller approves and lists the ERC721 token for sale
          await erc721Token.connect(seller).approve(await nftMarketPlace.getAddress(), tokenId);
          await nftMarketPlace.connect(seller).placetoSell(
              await erc721Token.getAddress(),
              tokenId,
              ethers.parseEther("1"),
              "NFT Item",
              "A unique NFT",
              "https://example.com/image",
              1
          );
  
          // Attempt to cancel the sale as a non-seller
          await expect(nftMarketPlace.connect(buyer).cancelSell(1)).to.be.revertedWith(
              "Only the seller can cancel"
          );
      });
  });
  



});
