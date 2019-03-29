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


const completeRevocation = async (state, user) => {
  const { link: adoptionLink, ip } = state;
  const { id: userId, email: userEmail, link: userLink } = user;

  const adoption = await getActionByLink(adoptionLink);

  const { user_id: adoptionUserId, form_id: formId } = adoption;
  if (adoptionUserId !== userId) {
    throw new InvalidArgumentError('Adoption does not belong to user.');
  }

  const result = await createRevocationByFormId(userId, formId, ip);

  sendRevocationEmail(userEmail, userLink);

  return result;
};


module.exports = completeRevocation;
