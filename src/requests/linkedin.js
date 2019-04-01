const axios = require('axios');
const qs = require('querystring');
const {
  AuthenticationError,
} = require('../utils/errors');


const AUTH_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const DEV_REDIRECT_URI = 'http://localhost:8081/modify/linkedin';
const PRODUCTION_REDIRECT_URI = 'https://trustlayerapi.trustbot.io/modify/linkedin';

const REDIRECT_URI = process.env.NODE_ENV === 'production' ? PRODUCTION_REDIRECT_URI : DEV_REDIRECT_URI;
console.log(`linked in redirect uri: ${REDIRECT_URI}`);

const CLIENT_ID = '78bo5ls26ov71s';
const PROFILE_URL = 'https://api.linkedin.com/v2/me?projection=(firstName,lastName,profilePicture(displayImage~:playableStreams))';
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


const getUserProfile = async (accessToken) => {
  const result = await authorizedRequest(PROFILE_URL, 'get', accessToken);

  if (!result.data) {
    throw new AuthenticationError('Error extracting user\'s profile');
  }

  const { firstName, lastName, profilePicture } = result.data;

  const profile = {};
  if (firstName) {
    const { en_US: firstNameValue } = firstName.localized;
    profile.firstName = firstNameValue;
  }
  if (lastName) {
    const { en_US: lastNameValue } = lastName.localized;
    profile.lastName = lastNameValue;
  }
  if (profilePicture) {
    const { elements } = profilePicture['displayImage~'];
    const { identifier: avatarUrl } = elements[0].identifiers[0];
    profile.avatarUrl = avatarUrl;
  }

  return profile;
};


const getUserEmail = async (accessToken) => {
  const result = await authorizedRequest(EMAIL_URL, 'get', accessToken);
  const { emailAddress } = result.data.elements[0]['handle~'];

  return emailAddress;
};


const validateUser = async (code) => {
  const { data: { access_token: accessToken } } = await sendValidationRequest(code);
  const profile = await getUserProfile(accessToken);
  const email = await getUserEmail(accessToken);
  if (!profile || !email) {
    throw new AuthenticationError('Error validating with LinkedIn');
  }


  return { profile, email };
};


module.exports = {
  validateUser,
};
