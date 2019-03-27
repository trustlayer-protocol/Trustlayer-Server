const express = require('express');
const { getAllForms } = require('../db/form');
const { ResourceNotFound } = require('../utils/errors');


const router = express.Router();


const processGetDefaultForm = async () => {
  const forms = await getAllForms();
  if (!forms || forms.length <= 0) {
    throw new ResourceNotFound('No forms found');
  }

  return forms[0];
};


router.get('/default-form', async (req, res, next) => {
  processGetDefaultForm()
    .then((form) => {
      res.locals.result = form;
      next();
    })
    .catch((err) => {
      next(err);
    });
});


module.exports = router;
