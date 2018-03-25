const spawnProcess = require('../primitives/executeInDir');

module.exports = {
	name: 'is-behind',
	description: 'Only results that are one or more commits behind from their remote counterpart',
	callback: (targetPath) => spawnProcess(targetPath, ['git', 'log', 'HEAD..FETCH_HEAD', '--oneline'])
		.then((messages) => messages.length >= 1)
};
