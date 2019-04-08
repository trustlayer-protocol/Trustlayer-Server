const {
  InvalidArgumentError,
} = require('../utils/errors');
const {
  getActionByLink,
} = require('../db/action');
const {
  createRevocationByFormId,
} = require('../utils/generators');
const {
  sendRevocationEmail,
} = require('../email');
const { pushRevocation } = require('../blockchain/transactions');


const completeRevocation = async (state, user) => {
  const { link: adoptionLink, ip } = state;
  const { id: userId, email: userEmail } = user;

  const adoption = await getActionByLink(adoptionLink);

  const { user_id: adoptionUserId, form_id: formId } = adoption;
  if (adoptionUserId !== userId) {
    throw new InvalidArgumentError('You can\'t revoke this adoption as it does not belong to you.');
  }

  const transactionHash = await pushRevocation(adoptionLink);

  const result = await createRevocationByFormId(userId, formId, ip, transactionHash);

  sendRevocationEmail(userEmail);

  return result;
};


module.exports = completeRevocation;
