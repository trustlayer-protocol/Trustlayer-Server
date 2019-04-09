const express = require('express');
const _ = require('lodash');
const githubHandler = require('./reader');

const router = express.Router();


const grabContent = async (path) => {
  const contentHandler = await githubHandler({ path });
  return contentHandler.getContent();
};


const handleRequest = async ({ commits }) => {
  if (!commits) return;

  const [commit] = commits;
  const {
    added: [fullPath],
    id,
    timestamp,
    author,
  } = commit;
  const filePath = fullPath.split('/');

  const [basePath, formType, version] = filePath;

  if (basePath !== 'forms') return;

  const { email } = author;

  const content = await grabContent(fullPath);

  const githubPushDetails = {
    email,
    id,
    formType,
    version,
    content,
    timestamp,
  };

  console.log(githubPushDetails);
};


router.post('/', (req, res, next) => {
  if (!_.isEmpty(req.body)) {
    handleRequest(req.body);
  }
  next();
});


module.exports = router;
