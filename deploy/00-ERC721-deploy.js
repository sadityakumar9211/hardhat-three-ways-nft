//this script deploys the helper contract ERC721.sol from openzepplien

const { network } = require("hardhat")
const { getNamedAccounts, deployments } = require("hardhat")
const { developmentChains, NAME, SYMBOL } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async function () {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId //This is important for the logic that--> mock is only deployed on a development chains.
    const args = [NAME, SYMBOL]
    if (developmentChains.includes(network.name)) {
        log("Deploying ERC721.sol smart contract on " + network.name + "...")
        //deploy a mock vrfCoordinatorV2... --> create one of those using the mocks on chainlink github.

        const erc721 = await deploy("ERC721", {
            from: deployer,
            args: args,
            log: true,
            waitConfirmations: 1,
        })
        log("ERC721.sol smart contract deployed successfully...")
    }
}

module.exports.tags = ["all", "ERC721"]
