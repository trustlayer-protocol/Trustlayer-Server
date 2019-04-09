const HDWalletProvider = require('truffle-hdwallet-provider');
const contract = require('truffle-contract');

const UNDA = require('../../build/contracts/UNDA.json');


const WEB_2_URL_BASE = 'https://github.com/trustlayer-protocol/Trustlayer-Universal-NDA/blob/master/forms/';
const { RINKEBY_MNEMOUNIC, INFURA_RINKEBY_URL, BC_ACCOUNT_ADDRESS } = process.env;


async function deployContract(title, author, license, terms, formName, version) {
  const provider = new HDWalletProvider(RINKEBY_MNEMOUNIC, INFURA_RINKEBY_URL);
  const newContract = await contract(UNDA);

  await newContract.setProvider(provider);
  const web2URL = `${WEB_2_URL_BASE}/${formName}(${version}).md`;
  const result = await newContract.new(
    title,
    version,
    author,
    license,
    terms,
    web2URL,
    {
      network_id: 4, // rinkeby id
      gas: 5500000,
      from: BC_ACCOUNT_ADDRESS,
    },
  );

  return result;
}


module.exports = deployContract;
