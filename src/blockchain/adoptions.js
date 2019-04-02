const fs = require('fs');
const client = require('./index');


const getAbiObject = () => {
  const fileContent = fs.readFileSync('./abi.json');
  const abi = JSON.parse(fileContent);

  return abi;
};


const pushAdoption = async () => {
  const api = getAbiObject();
};
