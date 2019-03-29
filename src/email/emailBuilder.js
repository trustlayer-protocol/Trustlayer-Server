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


const buildRevocationEmail = (userLink) => {
  const title = REVOCATION_COMPLETE_TITLE;
  let body = readTemplate('revocation.html');

  body = body.replace(/USER_LINK/g, `${NODE_BASE_URL}${userLink}`);

  return {
    body,
    title,
  };
};


const buildAgreementEmail = (otherEmail, link) => {
  const title = getAgreementCompleteTitle(otherEmail);
  let body = readTemplate('agreement.html');

  body = body.replace(/OTHER_EMAIL/g, otherEmail);
  body = body.replace(/AGREEMENT_LINK/g, `${NODE_BASE_URL}${link}`);

  return {
    title,
    body,
  };
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
  buildAgreementEmail,
  buildRevocationEmail,
};
