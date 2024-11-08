// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NftMarketPlace is ReentrancyGuard {
    IERC20 public erc20Token = IERC20(address(0));
    IERC721 public erc721Token = IERC721(address(0));
    IERC1155 public erc1155Token = IERC1155(address(0));

    struct Auction {
        address nftAddress;
        uint256 tokenId;
        address payable seller;
        uint256 minBid;
        uint256 highestBid;
        address payable highestBidder;
        uint256 endTime;
        bool isActive;
    }

    struct Productslist {
        address nftAddress; //need???
        uint256 tokenId;
        uint256 price;
        string sellType;
        string name;
        string description;
        string image;
        uint256 amount;
        string nftType;
    }

    Productslist[] public productslist;
    mapping(uint256 => Auction) public auctions;
    uint256 public auctionCount;

    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed seller,
        uint256 minBid,
        uint256 endTime
    );
    event NewBid(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount
    );
    event AuctionFinalized(
        uint256 indexed auctionId,
        address winner,
        uint256 amount
    );

    // Event to emit when a purchase is made
    event TokenPurchased(address buyer, uint256 tokenId);

    //ERC 721 buy sell
    function placetoSell(
        address nftAddress,
        uint256 tokenId,
        uint256 price,
        string memory sellType,
        string memory name,
        string memory description,
        string memory image,
        uint256 amount,
        string memory nftType
    ) public {
        //transfer the nft to contract
        erc721Token.safeTransferFrom(msg.sender, address(this), tokenId);
        //set the price and product info
        productslist.push(
            Productslist(
                nftAddress,
                tokenId,
                price,
                sellType,
                name,
                description,
                image,
                amount,
                nftType
            )
        );
    }

    //which need to buy
    function buyERC721(uint256 sellId, address buyer) public {
        require(
            erc721Token.ownerOf(productslist[sellId].tokenId) == address(this),
            "Token not for sale"
        );
        require(
            erc20Token.transferFrom(
                buyer,
                msg.sender,
                productslist[sellId].price
            ),
            "Transfer failed"
        );

        erc721Token.safeTransferFrom(
            msg.sender,
            buyer,
            productslist[sellId].tokenId
        );

        // remove the item from the list
        // Shift elements to the left
        for (uint i = sellId; i < productslist.length - 1; i++) {
            productslist[i] = productslist[i + 1];
        }

        // Remove the last element
        productslist.pop();

        emit TokenPurchased(buyer, productslist[sellId].tokenId);
    }

    //ERC 1155 buy sell

    function buyERC1155(
        uint256 tokenId,
        address buyer,
        uint256 tokenPrice,
        uint256 value
    ) public {
        require(
            erc20Token.transferFrom(msg.sender, address(this), tokenPrice),
            "Transfer failed"
        );

        erc1155Token.safeTransferFrom(address(this), buyer, tokenId, value, "");
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
