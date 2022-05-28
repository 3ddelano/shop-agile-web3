// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "hardhat/console.sol";

contract ShopAgileWeb3 {
    address payable public owner;

    constructor() public {
        owner = msg.sender;
    }
}
