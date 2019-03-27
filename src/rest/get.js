const express = require('express');
const { getAllForms, getFormById } = require('../db/form');
const { getActionsForUser } = require('../db/action');
const {
  getByLink: getUserByLink,
  getById: getUserById,
} = require('../db/user');
const { getByLink: getAgreementByLink } = require('../db/agreement');
const { ResourceNotFound } = require('../utils/errors');


const router = express.Router();

const processRequest = (promise, res, next) => {
  promise
    .then((form) => {
      res.locals.result = form;
      next();
    })
    .catch((err) => {
      next(err);
    });
};


const getDefaultForm = async () => {
  const forms = await getAllForms();
  if (!forms || forms.length <= 0) {
    throw new ResourceNotFound('No forms found');
  }

  return forms[0];
};


router.get('/default-form', async (req, res, next) => {
  processRequest(getDefaultForm(), res, next);
});


const getUserData = async (link) => {
  const user = await getUserByLink(link);
  if (!user) {
    throw new ResourceNotFound('User not found');
  }
  const { id: userId } = user;
  const actions = await getActionsForUser(userId, null, 1);
  const mostRecentAction = actions[0];

  const result = {
    user,
    recent_action: mostRecentAction,
  };

  if (!mostRecentAction) {
    return result;
  }

  const { form_id: formId } = mostRecentAction;
  const form = await getFormById(formId);
  result.recent_form = form;

  return result;
};


const getAgreementData = async (link) => {
  const agreement = await getAgreementByLink(link);
  if (!agreement) {
    throw new ResourceNotFound('Agreement not found.');
  }
  const {
    form_id: formId,
    user_1_id: user1Id,
    user_2_id: user2Id,
  } = agreement;

  const form = await getFormById(formId);
  const user1 = await getUserById(user1Id);
  const user2 = await getUserById(user2Id);
  const result = {
    agreement,
    form,
    user1,
    user2,
  };

  return result;
};


router.get('/user/:link', async (req, res, next) => {
  const { link } = req.params;
  processRequest(getUserData(link), res, next);
});


router.get('/agreement/:link', async (req, res, next) => {
  const { link } = req.params;
  processRequest(getAgreementData(link), res, next);
});


module.exports = router;
