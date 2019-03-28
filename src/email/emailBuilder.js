const fs = require('fs');
const path = require('path');


const NODE_BASE_URL = 'trustlayer.trustbot.io/';
const ADOPTION_COMPLETE_TITLE = 'Adoption confirmed on Trustlayer';
const REVOCATION_COMPLETE_TITLE = 'Revocation confirmation';
const getAgreementCompleteTitle = otherEmail => `Your agreement with ${otherEmail} is effective`;


const readTemplate = (fileName) => {
  const filePath = path.join(__dirname, `templates/${fileName}`);

  return fs.readFileSync(filePath, 'utf8');
};


const buildAdoptionEmail = (adoptionLink, userLink) => {
  const title = ADOPTION_COMPLETE_TITLE;
  let body = readTemplate('adoption.html');

  body = body.replace(/ADOPTION_LINK/g, `${NODE_BASE_URL}${adoptionLink}`);
  body = body.replace(/USER_LINK/g, `${NODE_BASE_URL}${userLink}`);

  return {
    title,
    body,
  };
};


module.exports = {
  buildAdoptionEmail,
};
