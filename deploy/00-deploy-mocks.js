//This script deploys the mocks that supports the RandomIpfsNft.sol smart contract on development chains.

const { developmentChains, BASE_FEE, GAS_PRICE_LINK } = require("../helper-hardhat-config")
const { network } = require("hardhat")

const DECIMALS = "18"
const INITIAL_PRICE = ethers.utils.parseUnits("2000", "ether")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId //This is important for the logic that--> mock is only deployed on a development chains.
    const args = [BASE_FEE, GAS_PRICE_LINK]
    if (developmentChains.includes(network.name)) {
        log("Deploying mocks for RandomIpfsNft.sol smart contract on " + network.name + "...")
        //deploy a mock vrfCoordinatorV2... --> create one of those using the mocks on chainlink github.
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            args: args,
            log: true,
            waitCofirmations: 1,
        })

        await deploy("MockV3Aggregator", {
            from: deployer, 
            log:  true, 
            args: [DECIMALS, INITIAL_PRICE],
            waitConfirmations: 1, 
        })
        
        log("Mocks Deployed!")
        log("#############################################")
    }
}

module.exports.tags = ["all", "mocks"]

