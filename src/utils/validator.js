const { InvalidArgumentError } = require('../utils/errors');

const validateParams = (request, next, ...params) => {
  for (const param of params) {
    if (!request.body[param] && !request.query[param]) {
      next(new InvalidArgumentError(`'${param}' cannot be null.`));
      break;
    }
  }
  next();
};

module.exports = {
  validateParams,
};
