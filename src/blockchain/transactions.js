const fs = require('fs');
const path = require('path');
const web3 = require('./index');

const {
  BC_CONCTRACT_ADDRESS,
  BC_ACCOUNT_ADDRESS,
} = process.env;


const getAbiObject = () => {
  const filePath = path.join(__dirname, './abi.json');
  const fileContent = fs.readFileSync(filePath);
  const abi = JSON.parse(fileContent);

  return abi;
};


const getContractInstance = () => {
  const abi = getAbiObject();

  return new web3.eth.Contract(abi, BC_CONCTRACT_ADDRESS);
};


const pushTransaction = async (method) => {
  const params = {
    from: BC_ACCOUNT_ADDRESS,
    gas: 100000,
  };

  return new Promise((resolve, reject) => {
    method.send(params, (error, transactionHash) => {
      if (error) {
        reject(error);
      } else {
        resolve(transactionHash);
      }
    });
  });
};


const pushAdoption = () => {
  const contract = getContractInstance();
  return pushTransaction(contract.methods.AdoptUNDAterms);
};


const pushRevocation = (adoptionLink) => {
  const contract = getContractInstance();
  return pushTransaction(contract.methods.RevokeAdoptionOfUNDA(adoptionLink));
};


const checkTransactions = async (tx1Hash, tx2Hash) => {
  let valid = true;
  try {
    const tx1Data = await web3.eth.getTransaction(tx1Hash);
    const { from: tx1From, to: tx1To } = tx1Data;

    const tx2Data = await web3.eth.getTransaction(tx2Hash);
    const { from: tx2From, to: tx2To } = tx2Data;

    if (tx1From !== BC_ACCOUNT_ADDRESS || tx1To !== BC_CONCTRACT_ADDRESS
      || tx2From !== BC_ACCOUNT_ADDRESS || tx2To !== BC_CONCTRACT_ADDRESS) {
      valid = false;
    }
  } catch (e) {
    valid = false;
  }

  return valid;
};


module.exports = {
  pushAdoption,
  pushRevocation,
  checkTransactions,
};
