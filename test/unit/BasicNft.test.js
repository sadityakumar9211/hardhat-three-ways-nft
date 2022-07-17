//this unit test runs on the development chains only...localhost, hardhat-network

const {
    developmentChains,
    networkConfig,
    NAME,
    SYMBOL,
    TOKEN_URI,
} = require("../../helper-hardhat-config")
const { deployments, getNamedAccounts, ethers, network } = require("hardhat")
const { assert, expect } = require("chai")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("BasicNft", () => {
          let basicNft, deployer, erc721
          const chainId = network.chainId
          //deploying the contract before any of the test is run
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"]) //This deploys all the contracts with "all" tag and takes a snapshot of the blockchain state and remembers that snapshot. This reduces the time consumed significantly.
              basicNft = await ethers.getContract("BasicNft", deployer) //getting the latest deployments of BasicNft contract and associating it with deployer account. Any function called on "basicNft" will now automatically be signed by the "deployer".
              erc721 = await ethers.getContract("ERC721", deployer)
          })

          describe("constructor", function () {
              it("initializes the BasicNft contract correctly", async function () {
                  //Ideally we make our test to have just 1 assert per it. But we are going to be a little bit loose here.
                  const name = await erc721.name()
                  const symbol = await erc721.symbol()
                  const tokenCounter = await basicNft.getTokenCounter()
                  const tokenUri = await basicNft.tokenURI(0) //same token uri for every token id. so say token id = 0

                  assert.equal(tokenCounter, "0")
                  assert.equal(name, NAME)
                  assert.equal(symbol, SYMBOL)
                  assert.equal(tokenUri, TOKEN_URI)
              })
          })
          describe("mintNFT", function () {
              it("Allows users to mint an NFT, and updates appropriately", async function () {
                  const txResponse = await basicNft.mintNft()
                  await txResponse.wait(1)
                  const tokenURI = await basicNft.tokenURI(0)
                  const tokenCounter = await basicNft.getTokenCounter()

                  assert.equal(tokenCounter.toString(), "1")
                  assert.equal(tokenURI, TOKEN_URI)
              })
          })
      })
