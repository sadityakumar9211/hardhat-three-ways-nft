// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "hardhat/console.sol";


contract DynamicSvgNft is ERC721 {
    //this will be a basic nft with
    //mint
    //store our SVG information somewhere
    //some logic to say "show X image" or "show Y image"

    //storage variables
    uint256 private s_tokenCounter;
    mapping(uint256 => int256) public s_tokenIdToHighValue;

    //immutable and constant variables
    string private i_lowImageURI;
    string private i_highImageURI;
    string private constant base64EncodedSvgPrefix = "data:image/svg+xml;base64,";
    AggregatorV3Interface internal immutable i_priceFeed;

    //events
    event CreatedNFT(uint256 indexed tokenId, int256 highValue);

    constructor(
        address priceFeedAddress,
        string memory lowSvg,
        string memory highSvg
    ) ERC721("Dynamic SVG NFT", "DSN") {
        s_tokenCounter = 0;
        i_lowImageURI = svgToImageURI(lowSvg);
        i_highImageURI = svgToImageURI(highSvg);
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function svgToImageURI(string memory svg) public pure returns (string memory) {
        // example:
        // '<svg width="500" height="500" viewBox="0 0 285 350" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="black" d="M150,0,L75,200,L225,200,Z"></path></svg>'
        // would return ""
        string memory svgBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(svg))));
        return string(abi.encodePacked(base64EncodedSvgPrefix, svgBase64Encoded));
    }

    //user doesnot need to pay money for minting this nft
    function mintNft(int256 highValue) public {
        s_tokenIdToHighValue[s_tokenCounter] = highValue;
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter += 1;
        emit CreatedNFT(s_tokenCounter, highValue);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    //creating the token URI here.
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "URI Query for nonexistent token");
        // string memory imageURI = "hi";

        (, int256 price, , , ) = i_priceFeed.latestRoundData();

        string memory imageURI = i_lowImageURI;
        if (price >= s_tokenIdToHighValue[tokenId]) {
            imageURI = i_highImageURI;
        }

        //creating the json

        //data:image/svg+xml;base64,    --> prefix for viewing image in browser
        //data:application/json;base64,  --> prefix for viewing encoding json in browser
        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":" ',
                                name(),
                                '", "description": "An NFT that changes based on the Chainlink Feed", "attributes":[{"trait_type:"coolness", "value": 100}], "image": "',
                                imageURI,
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    //view and pure functions
    function getLowSVG() public view returns (string memory) {
        return i_lowImageURI;
    }

    function getHighSVG() public view returns (string memory) {
        return i_highImageURI;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return i_priceFeed;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
