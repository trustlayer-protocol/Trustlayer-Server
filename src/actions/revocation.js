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


const completeRevocation = async (adoptionLink, userId, userLink, userEmail) => {
  const adoption = await getActionByLink(adoptionLink);
  const { user_id: adoptionUserId, form_id: formId } = adoption;
  if (adoptionUserId !== userId) {
    throw new InvalidArgumentError('Adoption does not belong to user.');
  }

  const result = await createRevocationByFormId(userId, formId);

  sendRevocationEmail(userEmail, userLink);


  return result;
};


module.exports = completeRevocation;
