const { InvalidArgumentError } = require('../utils/errors');

const validateParams = (request, next, ...params) => {
  let valid = true;
  for (const param of params) {
    if (!request.body[param] && !request.query[param]) {
      next(new InvalidArgumentError(`'${param}' cannot be null.`));
      valid = false;
      break;
    }
  }
  next();

  return valid;
};


module.exports = {
  validateParams,
};
