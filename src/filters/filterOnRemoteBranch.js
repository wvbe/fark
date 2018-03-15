'use strict';

const spawnProcess = require('../primitives/executeInDir');

module.exports = {
	name: 'on-remote-branch',
	description: 'Only results that are on a given remote branch name',
	callback: (targetPath, branchName) => spawnProcess(targetPath, ['git', 'rev-parse', '--abbrev-ref', 'HEAD@{u}'])
		.then((messages) => messages.length === 1 &&
			messages[0].data.toString().replace(/\n/gi, '') === 'origin/' + branchName)
};