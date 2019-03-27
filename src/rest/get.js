const express = require('express');
const { getAllForms, getFormById } = require('../db/form');
const { getActionsForUser } = require('../db/action');
const { getByLink } = require('../db/user');
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
  const user = await getByLink(link);
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


router.get('/user/:link', async (req, res, next) => {
  const { link } = req.params;
  processRequest(getUserData(link), res, next);
});


module.exports = router;
