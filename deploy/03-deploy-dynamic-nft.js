const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const fs = require("fs")

//hardhat developement environment is passed to this function by default which is same as hardhat
//so destructuring getNamedAccounts, deployments with from hardhat.
module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const chainId = network.config.chainId

    //finding the priceFeedAddress based on where the contract is deployed.
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const EthUsdAggregator = await ethers.getContract("MockV3Aggregator")
        ethUsdPriceFeedAddress = EthUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed
    }

    log("---------------------------------------------")
    const lowSvg = await fs.readFileSync("./images/Dynamic/frown.svg", "utf8")
    const highSvg = await fs.readFileSync("./images/Dynamic/happy.svg", "utf8")

    const args = [ethUsdPriceFeedAddress, lowSvg, highSvg]

    const dynamicSvgNft = await deploy("DynamicSvgNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    
    log("Dynamic SVG NFT Contract deployed successfully...")

    //verifying the contract on rinkeby.etherscan.io
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("verifying...")
        await verify(dynamicSvgNft.address, args)
        log("Contract Verified on Etherscan...")
    }
}


module.exports.tags = ["all", "dynamicsvg", "main"]