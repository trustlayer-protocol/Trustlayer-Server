const express = require('express');
const _ = require('lodash');
const githubHandler = require('./reader');
const deployBC = require('../blockchain/deploy');

const router = express.Router();


const grabContent = async (path) => {
  const contentHandler = await githubHandler({ path });
  return contentHandler.getContent();
};


const getMetadata = async (formType, version) => {
  const path = `forms/${formType}/metadata.json`;
  const metadataContent = await grabContent(path);
  const metadata = JSON.parse(metadataContent);
  if (!metadata[version]) {
    return console.log('Whoever pushed didn\'t add metadata!');
  }
  const pusheMetadata = metadata[version];

  return pusheMetadata;
};


const getPushData = async ({ commits }) => {
  if (!commits) return null;

  const [commit] = commits;
  const {
    added: [fullPath],
  } = commit;

  if (!fullPath) return null;

  const filePath = fullPath.split('/');

  const [basePath, formType] = filePath;
  let [, , version] = filePath;
  version = version.replace(/.md/g, '');

  if (basePath !== 'forms') return null;

  const content = await grabContent(fullPath);
  const metadata = await getMetadata(formType, version);
  if (!metadata) return null;

  const { title, author, license } = metadata;


  return {
    title,
    author,
    license,
    formType,
    version,
    terms: content,
  };
};


const processRequest = async (req) => {
  const pushData = await getPushData(req.body);
  if (!pushData) return;
  const result = await deployBC(pushData);
  console.log({ result });
};


router.post('/', async (req, res, next) => {
  if (!_.isEmpty(req.body)) {
    processRequest(req);
  }
  next();
});


module.exports = router;
