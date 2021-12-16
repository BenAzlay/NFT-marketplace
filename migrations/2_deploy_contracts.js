const Market = artifacts.require('./Market.sol')
const NFT = artifacts.require('./NFT.sol')
    
module.exports = async function (deployer) {
    await deployer.deploy(Market)
    const marketContract = await Market.deployed()
    const marketAddress = marketContract.address
    await deployer.deploy(NFT, marketAddress)
};