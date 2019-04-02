const express = require('express');
const {
  getAllForms,
  getFormById,
  getAvatarsOfFormAdopters,
} = require('../db/form');
const { 
  getActionsForUser,
  getActionById,
  } = require('../db/action');
const {
  getByLink: getUserByLink,
  getById: getUserById,
} = require('../db/user');
const { getByLink: getAgreementByLink } = require('../db/agreement');
const { ResourceNotFound } = require('../utils/errors');
const { verifyToken } = require('../security/jwt');


const router = express.Router();

const processRequest = (promise, res, next) => {
  promise
    .then((result) => {
      res.locals.result = result;
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

  const form = forms[0];
  const { id: formId } = form;
  const avatars = await getAvatarsOfFormAdopters(formId);
  return {
    form,
    avatars,
  };
};


router.get('/default-form', async (req, res, next) => {
  processRequest(getDefaultForm(), res, next);
});


const getUserActionsAndForm = async (user, actionType, limit) => {
  const { id: userId } = user;
  const actions = await getActionsForUser(userId, actionType, limit);

  const result = {
    user,
    actions,
  };

  if (!actions || actions.length <= 0) {
    return result;
  }

  const { form_id: formId } = actions[0];
  const form = await getFormById(formId);
  result.recent_form = form;

  return result;
};


const getSecureUserData = async (token) => {
  const tokenData = await verifyToken(token);
  const { userId } = tokenData;
  const user = await getUserById(userId);
  if (!user) {
    throw new ResourceNotFound('User not found');
  }

  return getUserActionsAndForm(user, null, null);
};


const getUserData = async (link) => {
  const user = await getUserByLink(link);
  if (!user) {
    throw new ResourceNotFound('User not found');
  }

  return getUserActionsAndForm(user, 'adopt', 1);
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
    adoption_1_id: adoption1Id,
    adoption_2_id: adoption2Id,
  } = agreement;

  const form = await getFormById(formId);
  const user1 = await getUserById(user1Id);
  const user2 = await getUserById(user2Id);
  const adoption1 = await getActionById(adoption1Id);
  const adoption2 = await getActionById(adoption2Id);
  const avatars = await getAvatarsOfFormAdopters(formId);
  const result = {
    agreement,
    form,
    user1,
    user2,
    adoption1,
    adoption2,
    avatars,
  };

  return result;
};


router.get('/user/secure/:token', (req, res, next) => {
  const { token } = req.params;
  processRequest(getSecureUserData(token), res, next);
});


router.get('/user/:link', (req, res, next) => {
  const { link } = req.params;
  processRequest(getUserData(link), res, next);
});


router.get('/agreement/:link', (req, res, next) => {
  const { link } = req.params;
  processRequest(getAgreementData(link), res, next);
});


module.exports = router;
