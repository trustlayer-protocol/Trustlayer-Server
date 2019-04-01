const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('../utils/errors');

const { JWT_TOKEN_SECRET } = process.env;

const generateToken = (userId) => {
  const token = jwt.sign({ userId }, JWT_TOKEN_SECRET, {
    algorithm: 'HS256',
    expiresIn: 120,
  });

  return token;
};


const verifyToken = token => new Promise((resolve, reject) => {
  jwt.verify(token, JWT_TOKEN_SECRET, { algorithms: ['HS256'] }, (err, decoded) => {
    if (err) {
      reject(new AuthenticationError(err.message));
    } else {
      resolve(decoded);
    }
  });
});


module.exports = {
  generateToken,
  verifyToken,
};
