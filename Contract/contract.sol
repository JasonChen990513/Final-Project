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
}
