// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract NftMarketPlace {
    IERC20 public erc20Token;
    IERC721 public erc721Token;
    IERC1155 public erc1155Token;

    // Event to emit when a purchase is made
    event TokenPurchased(address buyer, uint256 tokenId);

    //ERC 721 buy sell
    //which need to buy
    function buyERC721(uint256 tokenId, address memory to) public {
        require(
            erc721Token.ownerOf(tokenId) == address(this),
            "Token not for sale"
        );
        require(
            erc20Token.transferFrom(to, msg.sender, tokenPrice),
            "Transfer failed"
        );

        erc721Token.safeTransferFrom(msg.sender, to, tokenId);

        emit TokenPurchased(to, tokenId);
    }

    //ERC 1155 buy sell

    function buyERC1155() public {
        require(
            erc1155Token.ownerOf(tokenId) == address(this),
            "Token not for sale"
        );
        require(
            erc20Token.transferFrom(msg.sender, address(this), tokenPrice),
            "Transfer failed"
        );

        erc1155Token.safeTransferFrom(
            address(this),
            msg.sender,
            tokenId,
            value,
            ""
        );
    }

    // Function to create an auction
    function createAuction(
        address _nftAddress,
        uint256 _tokenId,
        uint256 _minBid,
        uint256 _duration
    ) external returns (uint256) {
        auctionCount++;
        uint256 auctionId = auctionCount;

        auctions[auctionId] = Auction({
            nftAddress: _nftAddress,
            tokenId: _tokenId,
            seller: payable(msg.sender),
            minBid: _minBid,
            highestBid: 0,
            highestBidder: payable(address(0)),
            endTime: block.timestamp + _duration,
            isActive: true
        });

        IERC721(_nftAddress).transferFrom(msg.sender, address(this), _tokenId);

        emit AuctionCreated(
            auctionId,
            msg.sender,
            _minBid,
            block.timestamp + _duration
        );
        return auctionId;
    }

    // Function to place a bid
    function placeBid(uint256 _auctionId) external payable nonReentrant {
        Auction storage auction = auctions[_auctionId];
        require(block.timestamp < auction.endTime, "Auction has ended");
        require(auction.isActive, "Auction is not active");
        require(
            msg.value > auction.minBid && msg.value > auction.highestBid,
            "Bid too low"
        );

        if (auction.highestBid > 0) {
            auction.highestBidder.transfer(auction.highestBid);
        }

        auction.highestBid = msg.value;
        auction.highestBidder = payable(msg.sender);

        emit NewBid(_auctionId, msg.sender, msg.value);
    }

    // Function to finalize the auction
    function finalizeAuction(uint256 _auctionId) external nonReentrant {
        Auction storage auction = auctions[_auctionId];
        require(block.timestamp >= auction.endTime, "Auction is still active");
        require(auction.isActive, "Auction has already been finalized");

        auction.isActive = false;

        if (auction.highestBidder != address(0)) {
            IERC721(auction.nftAddress).transferFrom(
                address(this),
                auction.highestBidder,
                auction.tokenId
            );
            auction.seller.transfer(auction.highestBid);
        } else {
            IERC721(auction.nftAddress).transferFrom(
                address(this),
                auction.seller,
                auction.tokenId
            );
        }

        emit AuctionFinalized(
            _auctionId,
            auction.highestBidder,
            auction.highestBid
        );
    }
}
