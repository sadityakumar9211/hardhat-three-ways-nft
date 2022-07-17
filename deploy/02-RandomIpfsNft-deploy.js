const { network } = require("hardhat")
const { getNamedAccounts, deployments } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const { storeImages, storeTokenUriMetadata } = require("../utils/uploadToPinata")
const imagesLocation = "./Images/Random" //relative to the project root directory.

let tokenUris = [
    "ipfs://QmYAeEtmSSK7dP4Lrtakmyt5sfaktV1dsXQqTjnWL1oqFS",
    "ipfs://QmdfjeVDHWGkQcDMnaEPBsVXoEgagemxo4EBFvtWiaAbPM",
    "ipfs://QmfABqDshMFoTpqRtBYBE77wEs9fVxdDxS5DFxKeXL2DRC",
]

const FUND_AMOUNT = "100000000000000000000"

const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    //diving stats to the nft
    attributes: {
        trait_type: "Cuteness",
        value: 100,
    },
}

module.exports = async function () {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId // This is for checking if we're on development chain or not

    //get the IPFS hashes of our images

    if (process.env.UPLOAD_TO_PINATA == "true") {
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
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
        subscriptionId = networkConfig[chainId].subscriptionId
    }

    log("------------------------------------")
    const args = [
        vrfCoordinatorV2Address,
        subscriptionId,
        networkConfig[chainId].gasLane,
        networkConfig[chainId].callbackGasLimit,
        tokenUris,
        networkConfig[chainId].mintFee,
    ]
    const randomIpfsNft = await deploy("RandomIpfsNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log("-----------------------------------------")
    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(randomIpfsNft.address, args)
    }
}

async function handleTokenUris() {
    let tokenUris = []
    //store the image in the IPFS network
    const { responses: imageUploadResponses, files } = await storeImages(imagesLocation)

    //store the metadata of the image which is basically the token URI.
    for (imageUploadResponseIndex in imageUploadResponses) {
        //create metadata and
        let tokenUriMetadata = { ...metadataTemplate }
        tokenUriMetadata.name = files[imageUploadResponseIndex].replace(".png", "")
        tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup!`
        tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`
        console.log(`Uploading ${tokenUriMetadata.name}...`)
        //upload metadata
        const metadataUploadResponse = await storeTokenUriMetadata(tokenUriMetadata)
        tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`)
    }
    console.log("Token Uris Uploaded!")
    console.log(tokenUris)
    return tokenUris
}

module.exports.tags = ["all", "randomipfs", "main"]
