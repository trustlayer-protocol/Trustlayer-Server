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


const uploadAgreementPDF = async (formId, agreementId) => {
  const form = await getFormById(formId);
  const { content: formMarkup } = form;
  marked(formMarkup, async (error, result) => {
    const buffer = await convertToPdf(result);
    uploadToS3(buffer, agreementId);
  });
};


const completeAdoptionFromLink = async (userId, userEmail, adoptionLink) => {
  const {
    adoption,
    agreement,
  } = await createAdoptionAndAgreementFromLink(userId, adoptionLink);
  const resultAction = adoption;
  const {
    id: agreementId,
    link: agreementLink,
    user_1_id: adoptionUserId,
  } = agreement;
  const adoptionUser = await getUserbyId(adoptionUserId);
  const { email: adoptionUserEmail } = adoptionUser;
  sendAgreementEmails(adoptionUserEmail, userEmail, agreementLink);
  const { form_id: formId } = adoption;

  uploadAgreementPDF(formId, agreementId);

  return resultAction;
};


const completeAdoption = async (adoptionLink, formId, userId, userEmail, userLink) => {
  let resultAction;
  if (!adoptionLink && formId) {
    resultAction = await createAdoptionByFormId(userId, formId);
  }
  if (adoptionLink) {
    resultAction = await completeAdoptionFromLink(userId, userEmail, adoptionLink);
  }
  const { link: newAdoptionLink } = resultAction;
  sendAdoptionEmail(userEmail, newAdoptionLink, userLink);


  return resultAction;
};


module.exports = completeAdoption;
