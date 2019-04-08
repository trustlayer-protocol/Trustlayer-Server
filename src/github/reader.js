var axios = require('axios')

const githubHandler = async ({
	owner = 'trustlayer-protocol',
	repo = 'Trustlayer-Universal-NDA',
	path
}) => {
	const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
	const { data } = await axios.get(url);

	const isDir = () => {
		return Array.isArray(data);
	};

	const isFile = () => {
		return data.type === 'file';
	};

	const getDirItems = () => {
		if (isDir())
			return data;
	};

	const getContent = () => {
		if (isDir()) new Error('Attempted to get content from directory');

		let buff = new Buffer(data.content, 'base64');
		let content = buff.toString('ascii');

		return content;
	};

	return {
		isDir,
		isFile,
		getContent
	};
};

module.exports = githubHandler;
