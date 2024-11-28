// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FinalProjectToken20 is ERC20, Ownable {
    constructor() ERC20("FinalProjectToken", "FPT") Ownable() {
        _mint(msg.sender, 1000 * (10 ** 18));
    }

    function mintToken(uint256 amount) public onlyOwner {
        _mint(msg.sender, amount);
    }
}
