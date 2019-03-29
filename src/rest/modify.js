const express = require('express');
const url = require('url');
const { validateParams } = require('../utils/validator');
const { validateUser: validateWithLinkedIn } = require('../requests/linkedin');
const {
  checkAndCreateUser,
} = require('../utils/generators');
const adoption = require('../actions/adoption');
const revocation = require('../actions/revocation');


const { InvalidArgumentError, AuthenticationError } = require('../utils/errors');
const { ACTION } = require('../utils/enums');


const router = express.Router();


const completeAction = async (user, { action, link, form_id: formId }) => {
  let actionResult;
  const { id: userId, link: userLink, email: userEmail } = user;
  if (action === ACTION.ADOPT) {
    actionResult = await adoption(link, formId, userId, userEmail, userLink);
  } else if (action === ACTION.REVOKE) {
    actionResult = await revocation(link, userId, userLink, userEmail);
  }

  return actionResult;
};


const parseStateParam = (state) => {
  const stateObject = JSON.parse(state);
  const { action, link, form_id: formId } = stateObject;

  if (!action || (!link && !formId)) {
    throw new InvalidArgumentError('\'state\' param does not have \'action\' or \'link\' or \'form_id\' properties');
  }


  return stateObject;
};


const validateUser = async (code) => {
  const validationResult = await validateWithLinkedIn(code);
  if (!validationResult || !validationResult.email) {
    throw new AuthenticationError('Error validating user credentials');
  }

  return validationResult;
};


const processLinkedInRequest = async (code, state) => {
  const validationResult = await validateUser(code);
  const { email, profile } = validationResult;

  const stateObject = parseStateParam(state);

  const user = await checkAndCreateUser(email, profile);
  const { link: userLink } = user;

  const resultAction = await completeAction(user, stateObject);
  return {
    ...resultAction,
    email,
    profile,
    userLink,
  };
};


router.get('/linkedin', (req, res, next) => validateParams(req, next, 'code', 'state'),
  async (req, res, next) => {
    const { code, state } = req.query;
    processLinkedInRequest(code, state)
      .then((result) => {
        const redirectUrl = url.format({
          query: result,
        });
        res.redirect(`http://localhost:3000/sso-success${redirectUrl}`);
      })
      .catch((err) => {
        next(err);
      });
  });

module.exports = router;
