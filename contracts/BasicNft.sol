//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BasicNft is      
    ERC721                      
{
    uint256 private s_tokenCounter;
    string private constant TOKEN_URI =
        "http://bafybeigr47gmbviwztbrgzaam6sg2xk2ludsetrplsqbdqfcrwazp5tpqm.ipfs.localhost:8080/";

    constructor() ERC721("Astronaut", "ASTRO") {
        s_tokenCounter = 0;
    }

    function mintNft() public returns (uint256) {
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter += 1;
        return s_tokenCounter;
    }




    //takes the token id and returns the token uri

    function tokenURI(uint256 /*tokenId*/) public pure override returns (string memory){
        // require(_exists(tokenId));
        return TOKEN_URI;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
