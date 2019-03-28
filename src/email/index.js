import axios from 'axios';


const requestMailgun = (to, title, htmlBody) => {
  const { MAILGUN_URL, MAILGUN_KEY, MAILGUN_FROM } = process.env;

  const data = {
    from: MAILGUN_FROM,
    to,
    html: htmlBody,
    title,
  };
  return axios.post(MAILGUN_URL, data, {
    auth: {
      username: 'api',
      password: MAILGUN_KEY,
    },
  });
};
