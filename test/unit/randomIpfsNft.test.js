//this unit test runs on the development chains only...localhost, hardhat-network

const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
const { deployments, getNamedAccounts, ethers, network } = require("hardhat")
const { assert, expect } = require("chai")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("RandomIpfsNft", function () {
        
    })
