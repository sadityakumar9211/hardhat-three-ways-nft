const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

//hardhat developement environment is passed to this function by default which is same as hardhat
//so destructuring getNamedAccounts, deployments with from hardhat.
module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    
}
