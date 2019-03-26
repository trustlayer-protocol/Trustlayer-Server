const express = require('express');
const nanoid = require('nanoid');
const url = require('url');
const { createNewUser } = require('../db/user');
const { validateParams } = require('../utils/validator');
const { validateUser } = require('../requests/linkedin');
const { InvalidArgumentError } = require('../utils/errors');

const router = express.Router();

const processLinkedInRequest = async (code, state) => {
  const stateObject = JSON.parse(state);

  const result = await validateUser(code);

  const user = result;
  user.link = `U${nanoid(10)}`;
  user.created = new Date().getTime();

  return createNewUser(user);
};


router.get('/linkedin', (req, res, next) => validateParams(req, next, 'code', 'state'),
  async (req, res, next) => {
    const { code, state } = req.query;
    processLinkedInRequest(code, state)
      .then((result) => {
        const redirectUrl = url.format({
          query: result,
        });
        res.redirect(`http://localhost:3000${redirectUrl}`);
      })
      .catch((err) => {
        next(new InvalidArgumentError(`Error validating your linkedin account: ${err.message}`));
      });
  });

module.exports = router;
