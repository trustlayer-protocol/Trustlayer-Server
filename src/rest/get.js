const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

router.get('/default-form', async (req, res, next) => {
  const filePath = path.join(__dirname, '../../', '/forms/default.txt');
  const content = fs.readFileSync(filePath, { encoding: 'utf-8' });

  res.locals.result = content;
  next();
});


module.exports = router;
