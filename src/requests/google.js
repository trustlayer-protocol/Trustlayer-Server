const axios = require('axios');
const {
  AuthenticationError,
} = require('../utils/errors');

const TOKEN_VERIFY_URL = 'https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=';
const USER_INFO_URL = 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=';

const { GOOGLE_DEV_CLIENT_ID, GOOGLE_PRODUCTION_CLIENT_ID, NODE_ENV } = process.env;

const CLIENT_ID = NODE_ENV === 'production' ? GOOGLE_PRODUCTION_CLIENT_ID : GOOGLE_DEV_CLIENT_ID;


const validateToken = async (accessToken) => {
  const url = `${TOKEN_VERIFY_URL}${accessToken}`;
  const result = await axios.get(url);
  if (!result.status === 200) {
    throw new AuthenticationError('Error validating access token');
  }
  const { aud } = result.data;
  if (aud !== CLIENT_ID) {
    throw new AuthenticationError('Invalid access token');
  }
};


const getUserInfo = async (accessToken) => {
  const url = `${USER_INFO_URL}${accessToken}`;
  const result = await axios.get(url);
  const { data: { email, name, picture } } = result;
  const profile = {
    fullName: name,
    avatarUrl: picture,
  };

  return {
    email,
    profile,
  };
};


const validateUser = async (accessToken) => {
  await validateToken(accessToken);
  const user = await getUserInfo(accessToken);

  return user;
};

module.exports = {
  validateUser,
};
