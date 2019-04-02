const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');

const { RINKEBY_MNEMOUNIC, INFURA_RINKEBY_URL } = process.env;

const provider = new HDWalletProvider(RINKEBY_MNEMOUNIC, INFURA_RINKEBY_URL);


const web3 = new Web3(provider);


module.exports = web3;
