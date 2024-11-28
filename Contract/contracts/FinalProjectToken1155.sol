// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract FinalProjectToken1155 is ERC1155, Ownable {
    string public name;
    string public symbol;
    uint256 public constant SWORD = 0;
    uint256 public constant AXE = 1;
    uint256 public constant BOW = 2;

    constructor()
        ERC1155(
            "https://gateway.pinata.cloud/ipfs/QmYJV45gcUYRAHVFsDT5p5UUv3JxnnwqzHNiQYqKVSCFmx/{id}.json"
        )
        Ownable()
    {
        name = "FPT1155";
        symbol = "FPT";
        mint(msg.sender, 0, 10, "");
        mint(msg.sender, 1, 10, "");
        mint(msg.sender, 2, 10, "");
    }

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function mint(
        address account,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public onlyOwner {
        _mint(account, id, amount, data);
    }

    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public onlyOwner {
        _mintBatch(to, ids, amounts, data);
    }

    function uri(
        uint256 _tokenid
    ) public pure override returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "https://gateway.pinata.cloud/ipfs/QmYJV45gcUYRAHVFsDT5p5UUv3JxnnwqzHNiQYqKVSCFmx/",
                    Strings.toString(_tokenid),
                    ".json"
                )
            );
    }
}
