const { expect } = require('chai');
const { ethers } = require('hardhat');


describe('Test All NFT Contract', function () {
    let ERC721, erc721, ERC1155, erc1155;
    let owner, user1, user2;
    const TOKEN_ID = 1;
    const AMOUNT = 10;

    before(async function () {
        // Set up accounts
        [owner, addr1, addr2] = await ethers.getSigners();

        // Deploy an ERC1155 contract
        ERC1155 = await ethers.getContractFactory("FinalProjectToken1155");
        erc1155 = await ERC1155.deploy();
        await erc1155.waitForDeployment();

        // Deploy an ERC721 contract
        ERC721 = await ethers.getContractFactory("FinalProjectToken721");
        erc721 = await ERC721.deploy();
        await erc721.waitForDeployment();
    });

    // Testing ERC-1155 mint, transfer, and approval
    describe("ERC1155 Tests", function () {
        it("Should mint ERC-1155 tokens", async function () {
            await erc1155.mint(addr1.address, TOKEN_ID, AMOUNT, "0x");
            expect(await erc1155.balanceOf(addr1.address, TOKEN_ID)).to.equal(AMOUNT);
        });

        it("Should approve and transfer ERC-1155 tokens", async function () {
            // Approve addr2 to transfer addr1's tokens
            await erc1155.connect(addr1).setApprovalForAll(addr2.address, true);
            expect(await erc1155.isApprovedForAll(addr1.address, addr2.address)).to.be.true;

            // Transfer tokens from addr1 to addr2
            await erc1155.connect(addr2).safeTransferFrom(addr1.address, addr2.address, TOKEN_ID, AMOUNT, "0x");
            expect(await erc1155.balanceOf(addr2.address, TOKEN_ID)).to.equal(AMOUNT);
            expect(await erc1155.balanceOf(addr1.address, TOKEN_ID)).to.equal(0);
        });
    });

    // Testing ERC-721 mint, transfer, and approval
    describe("ERC721 Tests", function () {
        it("Should mint an ERC-721 token", async function () {
            const tx = await erc721.mintNFT(addr1.address, "fakeURI");

            // Wait for the transaction to be mined
            const receipt = await tx.wait();
            const id = await erc721.currentTokenId();
            expect(id).to.equal(1);

            await expect(erc721.mintNFT(addr1.address, ""))
                .to.emit(erc721, "MintTokenId")
                .withArgs(addr1.address, 2);

            expect(await erc721.ownerOf(TOKEN_ID)).to.equal(addr1.address);
        });

        it("Should approve and transfer an ERC-721 token", async function () {
            // Approve addr2 to transfer TOKEN_ID on behalf of addr1
            await erc721.connect(addr1).approve(addr2.address, TOKEN_ID);
            expect(await erc721.getApproved(TOKEN_ID)).to.equal(addr2.address);

            // Transfer token from addr1 to addr2
            await erc721.connect(addr2).transferFrom(addr1.address, addr2.address, TOKEN_ID);
            expect(await erc721.ownerOf(TOKEN_ID)).to.equal(addr2.address);
        });
    });

});