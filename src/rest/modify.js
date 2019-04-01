const express = require('express');
const url = require('url');
const { validateParams } = require('../utils/validator');
const { validateUser: validateWithLinkedIn } = require('../requests/linkedin');
const {
  checkAndCreateUser,
} = require('../utils/generators');
const adoption = require('../actions/adoption');
const revocation = require('../actions/revocation');
const getPdf = require('../actions/get-agreement-pdf');


const { InvalidArgumentError } = require('../utils/errors');
const { ACTION } = require('../utils/enums');


const router = express.Router();


const completeAction = async (user, stateObject) => {
  let actionResult;
  const { action, link } = stateObject;
  if (action === ACTION.ADOPT) {
    actionResult = await adoption(stateObject, user);
  } else if (action === ACTION.REVOKE) {
    actionResult = await revocation(stateObject, user);
  } else if (action === ACTION.PDF) {
    actionResult = await getPdf(link, user.email);
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


const processLinkedInRequest = async (code, stateObject) => {
  const validationResult = await validateWithLinkedIn(code);
  const { email, profile } = validationResult;


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


const getRemoteIpAddress = (req) => {
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (ip === '::1') {
    ip = '127.0.0.1';
  }

  return ip;
};


router.get('/linkedin', (req, res, next) => validateParams(req, next, 'state'),
  async (req, res, next) => {
    const { code, state, error } = req.query;
    if (error) {
      return res.redirect(`http://localhost:3000/sso-fail?message=${error}`);
    }
    const ip = getRemoteIpAddress(req);
    const stateObject = parseStateParam(state);
    stateObject.ip = ip;
    return processLinkedInRequest(code, stateObject)
      .then((result) => {
        const { action } = stateObject;
        if (action === ACTION.PDF) {
          res.contentType('application/pdf');
          return res.end(result.Body, 'binary');
        }
        const redirectUrl = url.format({
          query: result,
        });
        return res.redirect(`http://localhost:3000/sso-success${redirectUrl}`);
      })
      .catch((err) => {
        next(err);
      });
  });

module.exports = router;
