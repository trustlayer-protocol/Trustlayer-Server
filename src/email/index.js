const axios = require('axios');
const qs = require('querystring');
const {
  buildAdoptionEmail,
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


const sendAdoptionEmail = async (to, adoptionLink, userLink) => {
  const emailContent = buildAdoptionEmail(adoptionLink, userLink);
  const { title, body } = emailContent;

  return requestMailgun(to, title, body);
};


module.exports = {
  sendAdoptionEmail,
};
