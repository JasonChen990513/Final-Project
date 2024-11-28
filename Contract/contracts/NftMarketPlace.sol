// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

contract NftMarketPlace is
    ReentrancyGuard,
    IERC721Receiver,
    IERC1155Receiver,
    ERC165
{
    IERC20 public erc20Token = IERC20(address(0));
    IERC721 public erc721Token = IERC721(address(0));
    IERC1155 public erc1155Token = IERC1155(address(0));

    constructor(
        address _erc20Token,
        address _erc721Token,
        address _erc1155Token
    ) {
        erc20Token = IERC20(_erc20Token);
        erc721Token = IERC721(_erc721Token);
        erc1155Token = IERC1155(_erc1155Token);
    }

    struct Auction {
        address nftAddress;
        uint256 tokenId;
        address payable seller;
        uint256 amount;
        uint256 minBid;
        uint256 highestBid;
        address payable highestBidder;
        uint256 endTime;
        bool isActive;
    }

    struct Productslist {
        uint256 id;
        address nftAddress;
        address payable seller;
        uint256 tokenId;
        uint256 price;
        string name;
        string description;
        string image;
        uint256 amount;
        bool sellStatus;
    }

    //Productslist[] public productslist;
    mapping(uint256 => Productslist) public productslist;
    mapping(uint256 => Auction) public auctions;
    uint256 public auctionCount = 0;
    uint256 public listIdCount = 0;

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

    event PlacetoSell(uint256 indexed listId);

    // Event to emit when a purchase is made
    event TokenPurchased(address buyer, uint256 tokenId);

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC165, IERC165) returns (bool) {
        return
            interfaceId == type(IERC721Receiver).interfaceId ||
            interfaceId == type(IERC1155Receiver).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes memory data
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes memory data
    ) external pure override returns (bytes4) {
        return IERC1155Receiver.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] memory ids,
        uint256[] memory values,
        bytes memory data
    ) external pure override returns (bytes4) {
        return IERC1155Receiver.onERC1155BatchReceived.selector;
    }

    function isERC721(address nftAddress) public view returns (bool) {
        return IERC165(nftAddress).supportsInterface(0x80ac58cd);
    }

    function isERC1155(address nftAddress) public view returns (bool) {
        return IERC165(nftAddress).supportsInterface(0xd9b67a26);
    }

    function placetoSell(
        address nftAddress,
        uint256 tokenId,
        uint256 price,
        string memory name,
        string memory description,
        string memory image,
        uint256 amount
    ) public {
        bool isERC721Token = isERC721(nftAddress);
        bool isERC1155Token = isERC1155(nftAddress);

        require(
            isERC721Token || isERC1155Token,
            "NFT must be ERC721 or ERC1155"
        );

        if (isERC721Token) {
            IERC721(nftAddress).safeTransferFrom(
                msg.sender,
                address(this),
                tokenId
            );
        } else if (isERC1155Token) {
            IERC1155(nftAddress).safeTransferFrom(
                msg.sender,
                address(this),
                tokenId,
                amount,
                ""
            );
        }

        listIdCount += 1;
        productslist[listIdCount] = Productslist({
            id: listIdCount,
            nftAddress: nftAddress,
            seller: payable(msg.sender),
            tokenId: tokenId,
            price: price,
            name: name,
            description: description,
            image: image,
            amount: amount,
            sellStatus: true
        });

        emit PlacetoSell(listIdCount);
    }

    function cancelSell(uint256 sellId) public {
        Productslist storage product = productslist[sellId];
        require(product.sellStatus, "Item not for sale");
        require(msg.sender == product.seller, "Only the seller can cancel");

        if (isERC721(product.nftAddress)) {
            // Transfer ERC721 token to buyer
            IERC721(product.nftAddress).safeTransferFrom(
                address(this),
                product.seller,
                product.tokenId
            );
        } else {
            // Transfer ERC1155 token to buyer
            IERC1155(product.nftAddress).safeTransferFrom(
                address(this),
                product.seller,
                product.tokenId,
                product.amount,
                ""
            );
        }

        product.sellStatus = false;
    }

    function buy(uint256 sellId) public nonReentrant {
        Productslist storage product = productslist[sellId];
        require(product.price > 0, "Item not for sale");

        product.sellStatus = false;

        // Check ERC20 allowance
        uint256 allowance = erc20Token.allowance(msg.sender, address(this));
        require(
            allowance >= product.price,
            "Insufficient allowance for ERC20 token transfer"
        );

        // Transfer payment
        require(
            erc20Token.transferFrom(msg.sender, product.seller, product.price),
            "Payment transfer failed"
        );

        if (isERC721(product.nftAddress)) {
            // Transfer ERC721 token to buyer
            IERC721(product.nftAddress).safeTransferFrom(
                address(this),
                msg.sender,
                product.tokenId
            );
        } else {
            // Transfer ERC1155 token to buyer
            IERC1155(product.nftAddress).safeTransferFrom(
                address(this),
                msg.sender,
                product.tokenId,
                product.amount,
                ""
            );
        }

        emit TokenPurchased(msg.sender, product.tokenId);
    }

    // Function to create an auction
    function createAuction(
        address nftAddress,
        uint256 tokenId,
        uint256 minBid,
        uint256 duration,
        uint256 amount
    ) external returns (uint256) {
        require(minBid > 0, "Minimum bid must be greater than zero");
        require(duration > 0, "Auction duration must be greater than zero");
        require(
            isERC721(nftAddress) || isERC1155(nftAddress),
            "NFT must be ERC721 or ERC1155"
        );

        auctionCount++;
        uint256 auctionId = auctionCount;

        auctions[auctionId] = Auction({
            nftAddress: nftAddress,
            tokenId: tokenId,
            seller: payable(msg.sender),
            minBid: minBid,
            amount: amount,
            highestBid: 0,
            highestBidder: payable(address(0)),
            endTime: block.timestamp + duration,
            isActive: true
        });

        bool isERC721Token = isERC721(nftAddress);
        bool isERC1155Token = isERC1155(nftAddress);

        if (isERC721Token) {
            IERC721(nftAddress).safeTransferFrom(
                msg.sender,
                address(this),
                tokenId
            );
        } else if (isERC1155Token) {
            IERC1155(nftAddress).safeTransferFrom(
                msg.sender,
                address(this),
                tokenId,
                amount,
                ""
            );
        }

        emit AuctionCreated(
            auctionId,
            msg.sender,
            minBid,
            block.timestamp + duration
        );
        return auctionId;
    }

    // Function to place a bid
    function placeBid(
        uint256 _auctionId,
        uint256 bidprice
    ) external payable nonReentrant {
        Auction storage auction = auctions[_auctionId];
        require(block.timestamp < auction.endTime, "Auction has ended");
        require(auction.isActive, "Auction is not active");
        require(
            bidprice > auction.minBid && bidprice > auction.highestBid,
            "Bid too low"
        );
        erc20Token.transferFrom(msg.sender, address(this), bidprice);

        if (auction.highestBid > 0) {
            //auction.highestBidder.transfer(auction.highestBid);
            erc20Token.transfer(auction.highestBidder, auction.highestBid);
        }

        auction.highestBid = bidprice;
        auction.highestBidder = payable(msg.sender);

        emit NewBid(_auctionId, msg.sender, bidprice);
    }

    // Function to finalize the auction
    function finalizeAuction(uint256 _auctionId) external nonReentrant {
        Auction storage auction = auctions[_auctionId];
        require(block.timestamp >= auction.endTime, "Auction is still active");
        require(auction.isActive, "Auction has already been finalized");

        auction.isActive = false;
        bool isERC721Token = isERC721(auction.nftAddress);
        bool isERC1155Token = isERC1155(auction.nftAddress);

        if (auction.highestBidder != address(0)) {
            if (isERC721Token) {
                IERC721(auction.nftAddress).safeTransferFrom(
                    address(this),
                    auction.highestBidder,
                    auction.tokenId
                );
            } else if (isERC1155Token) {
                IERC1155(auction.nftAddress).safeTransferFrom(
                    address(this),
                    auction.highestBidder,
                    auction.tokenId,
                    auction.amount,
                    ""
                );
            }

            erc20Token.transfer(auction.seller, auction.highestBid);
        } else {
            if (isERC721Token) {
                IERC721(auction.nftAddress).safeTransferFrom(
                    address(this),
                    auction.seller,
                    auction.tokenId
                );
            } else if (isERC1155Token) {
                IERC1155(auction.nftAddress).safeTransferFrom(
                    address(this),
                    auction.seller,
                    auction.tokenId,
                    auction.amount,
                    ""
                );
            }
        }

        emit AuctionFinalized(
            _auctionId,
            auction.highestBidder,
            auction.highestBid
        );
    }
}
