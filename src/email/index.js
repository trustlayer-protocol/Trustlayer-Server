const axios = require('axios');
const qs = require('querystring');
const {
  buildAdoptionEmail,
  buildAgreementEmail,
  buildRevocationEmail,
} = require('./emailBuilder');


const requestMailgun = (to, subject, htmlBody) => {
  const { MAILGUN_URL, MAILGUN_KEY, MAILGUN_FROM } = process.env;

  const data = {
    from: MAILGUN_FROM,
    to,
    html: htmlBody,
    subject,
  };
  return axios.post(MAILGUN_URL, qs.stringify(data), {
    auth: {
      username: 'api',
      password: MAILGUN_KEY,
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};


const sendAgreementEmail = async (to, otherEmail, agreementLinkl) => {
  const emailContent = buildAgreementEmail(otherEmail, agreementLinkl);
  const { title, body } = emailContent;

  return requestMailgun(to, title, body);
};


const sendAgreementEmails = async (user1Email, user2Email, agreementLinkl) => {
  sendAgreementEmail(user1Email, user2Email, agreementLinkl);
  sendAgreementEmail(user2Email, user1Email, agreementLinkl);
};


const sendAdoptionEmail = async (to, adoptionLink, userLink) => {
  const emailContent = buildAdoptionEmail(adoptionLink, userLink);
  const { title, body } = emailContent;

  return requestMailgun(to, title, body);
};


const sendRevocationEmail = async (to, userLink) => {
  const emailContent = buildRevocationEmail(userLink);
  const { title, body } = emailContent;

  return requestMailgun(to, title, body);
};


module.exports = {
  sendAdoptionEmail,
  sendAgreementEmails,
  sendRevocationEmail,
};
