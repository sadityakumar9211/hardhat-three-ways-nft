const { network } = require("hardhat")
const { getNamedAccounts, deployments } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log("Deploying Basic NFT contract...")

    const args = []

    const basicNft = await deploy("BasicNft", {
        args: args,
        from: deployer,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    log(`Basic NFT Contract deployed successfully at ${basicNft.address}`)

    //verifying the contract on rinkeby.etherscan.io
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("verifying...")
        await verify(basicNft.address, args)
        log("Contract Verified on Etherscan...")
    }
}

module.exports.tags = ["all", "BasicNft", "main"]

