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
  getById: getUserbyId,
} = require('../db/user');
const {
  getFormById,
} = require('../db/form');
const convertToPdf = require('../pdf/html-pdf');
const {
  uploadToS3,
} = require('../aws/nda-upload');


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
  linkUserEmail,
  userEmail,
) => {
  const { form_id: formId } = adoption;

  const form = await getFormById(formId);
  const { content: formMarkup } = form;
  const html = await markedPromise(formMarkup, linkAdoption, adoption, linkUserEmail, userEmail);
  const buffer = await convertToPdf(html, linkAdoption, adoption, linkUserEmail, userEmail);
  uploadToS3(buffer, agreementId);

  return buffer;
};


const completeAdoptionFromLink = async (userId, userEmail, adoptionLink, ip) => {
  const {
    linkAdoption,
    newAdoption,
    agreement,
  } = await createAdoptionAndAgreementFromLink(userId, adoptionLink, ip);
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
    newAdoption, linkUserEmail, userEmail);
  sendAgreementEmails(linkUserEmail, userEmail, agreementLink, buffer);

  return {
    adoption: newAdoption,
    agreement,
  };
};


const completeAdoption = async (stateObject, user) => {
  let resultAction;
  const { link, form_id: formId, ip } = stateObject;
  const { id: userId, email: userEmail, link: userLink } = user;
  if (!link && formId) {
    resultAction = await createAdoptionByFormId(userId, formId, ip);
  }
  if (link) {
    resultAction = await completeAdoptionFromLink(userId, userEmail, link, ip);
  }
  sendAdoptionEmail(userEmail, userLink);


  return resultAction;
};


module.exports = completeAdoption;
