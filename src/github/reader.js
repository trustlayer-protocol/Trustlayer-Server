const axios = require('axios');

const githubHandler = async ({
  owner = 'trustlayer-protocol',
  repo = 'Trustlayer-Universal-NDA',
  path,
}) => {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const { data } = await axios.get(url);

  const isDir = () => Array.isArray(data);

  const isFile = () => data.type === 'file';

  const getDirItems = () => {
    if (isDir()) { return data; }
    return null;
  };

  const getContent = () => {
    if (isDir()) throw Error('Attempted to get content from directory');

    const buff = new Buffer(data.content, 'base64');
    const content = buff.toString('ascii');

    return content;
  };

  return {
    isDir,
    isFile,
    getContent,
    getDirItems,
  };
};

module.exports = githubHandler;
