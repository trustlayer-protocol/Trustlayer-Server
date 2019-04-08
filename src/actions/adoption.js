const marked = require('marked');
const {
  createAdoptionByFormId,
  createAdoptionAndAgreementFromLink,
} = require('../utils/generators');
const {
  sendAdoptionEmail,
  sendAgreementEmails,
} = require('../email');
const {
  getActionByLink,
} = require('../db/action');
const {
  getById: getUserbyId,
} = require('../db/user');
const {
  getFormById,
} = require('../db/form');
const convertToPdf = require('../pdf/html-pdf');
const {
  uploadToS3,
} = require('../aws/nda-upload');
const {
  pushAdoption,
} = require('../blockchain/transactions');
const {
  InvalidArgumentError,
  ResourceNotFound,
} = require('../utils/errors');


const markedPromise = formMarkup => new Promise((resolve, reject) => {
  marked(formMarkup, async (error, result) => {
    if (error) {
      reject(error);
    } else {
      resolve(result);
    }
  });
});


const uploadAgreementPDF = async (
  agreementId,
  linkAdoption,
  adoption,
  linkUser,
  user,
) => {
  const { form_id: formId } = adoption;

  const form = await getFormById(formId);
  const { content: formMarkup } = form;
  const html = await markedPromise(formMarkup);
  const buffer = await convertToPdf(html, linkAdoption, adoption, linkUser, user);
  uploadToS3(buffer, agreementId);

  return buffer;
};


const completeAdoptionFromLink = async (user, linkAdoption, ip, transactionHash) => {
  const { id: userId, email: userEmail } = user;
  const {
    newAdoption,
    agreement,
  } = await createAdoptionAndAgreementFromLink(userId, linkAdoption, ip, transactionHash);
  const {
    id: agreementId,
    link: agreementLink,
  } = agreement;
  const {
    user_id: linkUserId,
  } = linkAdoption;

  const linkUser = await getUserbyId(linkUserId);
  const { email: linkUserEmail } = linkUser;

  const buffer = await uploadAgreementPDF(agreementId, linkAdoption,
    newAdoption, linkUser, user);
  sendAgreementEmails(linkUserEmail, userEmail, agreementLink, buffer);

  return {
    adoption: newAdoption,
    agreement,
  };
};


const adoptionFromLink = async (link, user, ip) => {
  const linkAdoption = await getActionByLink(link);
  const { user_id: linkUserId } = linkAdoption;
  const { id: userId } = user;
  if (linkUserId === userId) throw new InvalidArgumentError('Looks like you tried to adopt from your own link, unfortunately you can\'t do that.');
  if (!linkAdoption) throw new ResourceNotFound(`Could not find adoption for link: '${link}'.`);

  const transactionHash = await pushAdoption();
  return completeAdoptionFromLink(user, linkAdoption, ip, transactionHash);
};


const completeAdoption = async (stateObject, user) => {
  let resultAction;
  const { link, form_id: formId, ip } = stateObject;
  const { id: userId, email: userEmail, link: userLink } = user;
  if (!link && formId) {
    const transactionHash = await pushAdoption();
    resultAction = await createAdoptionByFormId(userId, formId, ip, transactionHash);
  }
  if (link) {
    resultAction = await adoptionFromLink(link, user, ip);
  }
  sendAdoptionEmail(userEmail, userLink);


  return resultAction;
};


module.exports = completeAdoption;
