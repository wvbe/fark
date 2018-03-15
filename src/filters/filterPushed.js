'use strict';

const spawnProcess = require('../primitives/executeInDir');

module.exports = {
	name: 'is-ahead',
	description: 'Only results that have unpushed commits',
	callback: (targetPath) => spawnProcess(targetPath, ['git', 'cherry', '-v'])
		.then((messages) => messages.length > 0)
};
