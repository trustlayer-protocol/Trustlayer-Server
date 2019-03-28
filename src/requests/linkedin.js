const axios = require('axios');
const qs = require('querystring');


const AUTH_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const REDIRECT_URI = 'http://localhost:3002/modify/linkedin';
const CLIENT_ID = '78bo5ls26ov71s';
const PROFILE_URL = 'https://api.linkedin.com/v2/me?projection=(profilePicture(displayImage~:playableStreams))';
const EMAIL_URL = 'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))';


const sendValidationRequest = (code) => {
  const data = {
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    client_secret: process.env.LINKEDIN_SECRET,
  };

  return axios.post(AUTH_URL, qs.stringify(data), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};


const authorizedRequest = async (url, method, accessToken, data = {}) => (
  axios(url, {
    method,
    data,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
);


const getUserAvatarUrl = async (accessToken) => {
  const result = await authorizedRequest(PROFILE_URL, 'get', accessToken);

  const { elements } = result.data.profilePicture['displayImage~'];
  const { identifier: profileUrl } = elements[0].identifiers[0];

  return profileUrl;
};


const getUserEmail = async (accessToken) => {
  const result = await authorizedRequest(EMAIL_URL, 'get', accessToken);
  const { emailAddress } = result.data.elements[0]['handle~'];

  return emailAddress;
};


const validateUser = async (code) => {
  const { data: { access_token: accessToken } } = await sendValidationRequest(code);
  const avatarUrl = await getUserAvatarUrl(accessToken);
  const email = await getUserEmail(accessToken);

  return { avatarUrl, email };
};


module.exports = {
  validateUser,
};
