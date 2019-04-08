const express = require('express');
const changeCase = require('change-case');
const githubHandler = require('./reader');
const _ = require('lodash');
const router = express.Router();


const grabContent = async path => {
  const contentHandler = await githubHandler({ path })
  return contentHandler.getContent()
}


const handleRequest = async ({ commits }) => {
  const added = commits[0].added;
  const filePath = added[0].split('/');
  let category, fileName, version

  if (filePath[0] === 'forms') {
    category = filePath[1]
    fileName = filePath[2]
  }

    //await githubHandler({ path })
    //category + 'metadata.json'

    const email = commits[0].author.email
    const id = commits[0].id
    const timestamp = commits[0].timestamp
    const insideBracketRE = /\((.*)\)/
    version = fileName.match(insideBracketRE)[1]

  const content = await grabContent(added[0])

  const githubPushDetails = {
    id,
    category,
    fileName,
    version,
    content,
    timestamp
  }

  console.log(object)
}


router.post('/', (req, res, next) => {
  if (!_.isEmpty(req.body)) {
    handleRequest(req.body)
  } else {
    res.send({ text: 'error' });
  }
});

module.exports = router;
