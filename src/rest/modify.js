const express = require('express');
const url = require('url');
const { validateParams } = require('../utils/validator');
const { validateUser } = require('../requests/linkedin');
const {
  checkAndCreateUser,
  createAdoptionByFormId,
  createAdoptionByLink,
} = require('../utils/generators');
const { InvalidArgumentError, AuthenticationError } = require('../utils/errors');
const { ACTION } = require('../utils/enums');


const router = express.Router();


const completeAction = async (userId, { action, link, form_id: formId }) => {
  let resultAction;
  if (action === ACTION.ADOPT) {
    if (!link && formId) {
      resultAction = await createAdoptionByFormId(userId, formId);
    }
    if (link) {
      resultAction = await createAdoptionByLink(userId, link);
    }
  }

  return resultAction;
};


const processLinkedInRequest = async (code, state) => {
  const validationResult = await validateUser(code);
  if (!validationResult || !validationResult.email
    || !validationResult.avatarUrl) {
    throw new AuthenticationError('Error validating user credentials');
  }
  const stateObject = JSON.parse(state);
  const { action, link, form_id: formId } = stateObject;

  if (!action || (!link && !formId)) {
    throw new InvalidArgumentError('\'state\' param does not have \'action\' or \'link\' or \'form_id\' properties');
  }

  const { email, avatarUrl } = validationResult;

  const user = await checkAndCreateUser(email, avatarUrl);
  const { id: userId, link: userLink } = user;

  const resultAction = await completeAction(userId, stateObject);
  const { link: adoptionLink, form_hash: formHash } = resultAction;
  return {
    email,
    avatarUrl,
    userLink,
    adoptionLink,
    formHash,
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
