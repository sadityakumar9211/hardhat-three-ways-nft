//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error RandomIpfsNft__RangeOutOfBounds();
error RandomIpfsNft__NeedMoreETHSent();
error RandomIpfsNft__TransferFailed();

contract RandomIpfsNft is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
    //when we mint an NFT, we will trigger a chainlink VRF call to get a random number
    //using that number we will get a random NFT
    //Pug, Shiba Inu, St. Bernard
    //Pug - super rare
    //Shiba Inu - sort of rare
    //St. Bernard - most common

    //users ahve to pay to mint an NFT
    // the owner of the contract can withdraw the ETH


    //Type Declaration
    enum Breed{
        PUG, 
        SHIBA_INU,
        ST_BERNARD 
    }

    VRFCoordinatorV2Interface private immutable i_vrfCoordinator; //holds the address of the contract that will handle the VRF calls
    uint64 private immutable i_subscriptionId; //the subscription id of the VRF call
    bytes32 private immutable i_gasLane; //the key hash of the VRF keypair that will be used to generate the random number
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    //VRF helpers
    mapping(uint256 => address) public s_requestIdToSender;

    //NFT Variables
    uint256 internal immutable i_mintFee;
    uint256 public s_tokenCounter;
    uint256 internal constant MAX_CHANCE_VALUE = 100;
    string[] internal s_dogTokenUris;

    //Events
    event NftRequested(uint256 indexed requestId, address requester);
    event NftMinted(Breed dogBreed, address minter);
 
    constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit,
        string[3] memory dogTokenUris,
        uint256 mintFee
    ) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("Random IPFS NFT", "RIN"){
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId = subscriptionId;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
        s_dogTokenUris = dogTokenUris;
        i_mintFee = mintFee;
    }

    function requestNft() public payable returns (uint256 requestId){
        if(msg.value < i_mintFee){
            revert RandomIpfsNft__NeedMoreETHSent();
        }
         requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
         );
         s_requestIdToSender[requestId] = msg.sender;
         emit NftRequested(requestId, msg.sender);
    }

    //this fulfilRandomWords is called by the chainlink node
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        address dogOwner = s_requestIdToSender[requestId];
        uint256 newItemId = s_tokenCounter;
        s_tokenCounter = s_tokenCounter + 1;
        // what does this token look like?
        uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;
        Breed dogBreed = getBreedFromModdedRng(moddedRng);
        _safeMint(dogOwner, newItemId);      //he has gotten a token a particular token id but which token is not yet determined. 
        _setTokenURI(newItemId, s_dogTokenUris[uint256(dogBreed)]);
        emit NftMinted(dogBreed, dogOwner);
    }

    function withdraw() public payable onlyOwner{
        uint256 amount = address(this).balance;  //checking the contract balance
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if(!success){
            revert RandomIpfsNft__TransferFailed();
        }
    }

    function getBreedFromModdedRng(uint256 moddedRng) public view returns (Breed){
        uint256 cumulativeSum = 0;
        uint256 [3] memory chanceArray = getChanceArray();
        for(uint256 i =0;i<chanceArray.length;i++){
            if(moddedRng >= cumulativeSum && moddedRng < cumulativeSum + chanceArray[i]){
                return Breed(i);
            }
            cumulativeSum += chanceArray[i];
        }
        revert RandomIpfsNft__RangeOutOfBounds();
    }

    function getChanceArray() public pure returns (uint256[3] memory){
        return [10, 30, MAX_CHANCE_VALUE];     //10, 20, 70
    }

    function getMintFee() public view returns(uint256){
        return i_mintFee;
    }

    function getDogTokenUris(uint256 index) public view returns(string memory){
        return s_dogTokenUris[index];
    }
    
    function getTokenCounter() public view returns(uint256){
        return s_tokenCounter;
    }
}
