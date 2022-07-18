//Configurations for deployment on various networks --> values of vrfCoordinatorV2 changes on
//various networks

const { ethers } = require("ethers")

const networkConfig = {     //all the parameters that are different chain-to-chain.
    4: {
        name: "rinkeby",
        vrfCoordinatorV2: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",   //30 GWei GasLane
        subscriptionId: 7203,
        callbackGasLimit: "500000",
        mintFee: ethers.utils.parseEther("0.01"), // 0.01 ETH
        waitConfirmations: 6,
        ethUsdPriceFeed: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
    }, 
    31337: {
        name: "hardhat",
        
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        callbackGasLimit: "500000",
        mintFee: ethers.utils.parseEther("0.01"), // 0.01 ETH
        waitConfirmations: 1,
    }

}

const developmentChains = ["hardhat", "localhost"]

const NAME = "Astronaut"
const SYMBOL = "ASTRO"
const TOKEN_URI = "http://bafybeigr47gmbviwztbrgzaam6sg2xk2ludsetrplsqbdqfcrwazp5tpqm.ipfs.localhost:8080/"

const BASE_FEE = ethers.utils.parseEther("0.25")    //0.25 is the premium. It costs 0.25 LINK to request a random number
const GAS_PRICE_LINK =  1e9       //link per gas

module.exports = {
    networkConfig,
    developmentChains,
    NAME,
    SYMBOL,
    TOKEN_URI, 
    BASE_FEE,
    GAS_PRICE_LINK
}
