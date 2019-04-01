const { AuthenticationError } = require('../utils/errors');
const { getUserEmailsForAgreement } = require('../db/agreement');
const { getAgreementFromS3 } = require('../aws/nda-upload');

const processRequest = async (link, email) => {
  const agreementEmails = await getUserEmailsForAgreement(link);
  const { email1, email2, id: agreementId } = agreementEmails;
  if (email !== email1 && email !== email2) {
    throw new AuthenticationError('User does not have an access to the agreement');
  }

  const data = await getAgreementFromS3(agreementId);

  return data;
};


module.exports = processRequest;
