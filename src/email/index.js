const { MAILGUN_DOMAIN, MAILGUN_KEY, MAILGUN_FROM } = process.env;
const mailgun = require('mailgun-js')({ apiKey: MAILGUN_KEY, domain: MAILGUN_DOMAIN });
const {
  buildAdoptionEmail,
  buildAgreementEmail,
  buildRevocationEmail,
} = require('./emailBuilder');


const requestMailgun = (to, subject, htmlBody, attachment = null) => {
  const data = {
    from: MAILGUN_FROM,
    to,
    subject,
    html: htmlBody,
  };

  if (attachment) {
    data.attachment = attachment;
  }

  return mailgun.messages().send(data);
};


const sendAgreementEmail = async (to, otherEmail, agreementLinkl, attch) => {
  const emailContent = buildAgreementEmail(otherEmail, agreementLinkl);
  const { title, body } = emailContent;

  return requestMailgun(to, title, body, attch);
};


const sendAgreementEmails = async (user1Email, user2Email, agreementLink, buffer) => {
  const attch = new mailgun.Attachment({ data: buffer, filename: `${agreementLink}.pdf` });
  sendAgreementEmail(user1Email, user2Email, agreementLink, attch);
  sendAgreementEmail(user2Email, user1Email, agreementLink, attch);
};


const sendAdoptionEmail = async (to, userLink) => {
  const emailContent = buildAdoptionEmail(userLink);
  const { title, body } = emailContent;

  return requestMailgun(to, title, body);
};


const sendRevocationEmail = async (to) => {
  const emailContent = buildRevocationEmail();
  const { title, body } = emailContent;

  return requestMailgun(to, title, body);
};


module.exports = {
  sendAdoptionEmail,
  sendAgreementEmails,
  sendRevocationEmail,
};
