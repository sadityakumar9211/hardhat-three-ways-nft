const { network } = require("hardhat")
const { getNamedAccounts, deployments } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const { storeImages } = require("../utils/uploadToPinata")

const imagesLocation = "./Images/Random"    //relative to the project root directory.

module.exports = async function () {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId // This is for checking if we're on development chain or not

    //get the IPFS hashes of our images

    if (process.env.UPLOAD_TO_PINATA == true) {
        tokenUris = await handleTokenUris()
    }

    //1. with our own IPFS node. can be done programmatically https://docs.ipfs.io/
    //2. Pinata https://www.pinata.cloud/   //one centralized entity and my node are pining the nft Uris
    //3. NFT.storage  https://nft.storage/   //entire filecoin blockchain

    //finding the `subscription Id` and `vrfCoordinatorV2Address`
    let vrfCoordinatorV2Address, subscriptionId
    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address

        const tx = await vrfCoordinatorV2Mock.createSubscription()
        const txReceipt = await tx.wait(1)
        subscriptionId = txReceipt.events[0].args.subId
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
        subscriptionId = networkConfig[chainId].subscriptionId
    }

    log("------------------------------------")
    // const args = [
    //     vrfCoordinatorV2Address,
    //     subscriptionId,
    //     networkConfig[chainId].gasLane,
    //     networkConfig[chainId].callbackGasLimit,
    //     // token Uris
    //     networkConfig[chainId].mintFee,
    // ]
}

async function handleTokenUris() {
    let tokenUris = []

    //store the image in the IPFS network
    //store the metadata of the image which is basically the token URI.

    return tokenUris
}


module.exports.tags = ["all", "randomipfs", "main"]