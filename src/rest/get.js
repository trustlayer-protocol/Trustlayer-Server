const express = require('express');
const {
  getAllForms,
  getFormById,
  getAvatarsOfFormAdopters,
  getFormsByIds,
} = require('../db/form');
const {
  getActionsForUser,
  getActionById,
} = require('../db/action');
const {
  getByLink: getUserByLink,
  getById: getUserById,
  getUserByEmail,
} = require('../db/user');
const {
  getByLink: getAgreementByLink,
  getByUserId: getAgreementsByUserId,
} = require('../db/agreement');
const { ResourceNotFound } = require('../utils/errors');
const { verifyToken } = require('../security/jwt');
const _ = require('lodash');


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
    throw new ResourceNotFound('No adoption forms found.');
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
  const avatars = await getAvatarsOfFormAdopters(formId);
  result.recent_form = form;
  result.avatars = avatars;

  return result;
};


const getUserInfoByEmail = async (email) => {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new ResourceNotFound('User not found.');
  }

  const actions = await getActionsForUser(user.id, null, null);
  const uniqueFormActions = _.sortedUniqBy(actions, (val) => val.form_id)
  const validFormIds = uniqueFormActions
    .filter(action => action.action === 'adopt')
    .map(action => action.form_id);

  const userForms = await getFormsByIds(validFormIds);
  const formsHaveType = userForms.filter(form => form.type);

  return {
    user,
    forms: formsHaveType
  };
}


const getSecureUserData = async (token) => {
  const tokenData = await verifyToken(token);
  const { userId } = tokenData;
  const user = await getUserById(userId);
  if (!user) {
    throw new ResourceNotFound('User not found.');
  }

  return getUserActionsAndForm(user, null, null);
};


const getUserData = async (link) => {
  const user = await getUserByLink(link);
  if (!user) {
    throw new ResourceNotFound('User not found.');
  }

  return getUserActionsAndForm(user, null, 1);
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


const getAgreementsData = async (userId) => {
  const agreements = await getAgreementsByUserId(userId);

  return agreements;
};


router.get('/user/secure/:token', (req, res, next) => {
  const { token } = req.params;
  processRequest(getSecureUserData(token), res, next);
});


router.get('/user/email/:email', (req, res, next) => {
  const { email } = req.params;
  processRequest(getUserInfoByEmail(email), res, next);
});


router.get('/user/:link', (req, res, next) => {
  const { link } = req.params;
  processRequest(getUserData(link), res, next);
});


router.get('/agreement/:link', (req, res, next) => {
  const { link } = req.params;
  processRequest(getAgreementData(link), res, next);
});


router.get('/agreements/:userId', (req, res, next) => {
  const { userId } = req.params;
  processRequest(getAgreementsData(userId), res, next);
});

module.exports = router;
