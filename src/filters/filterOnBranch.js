'use strict';

const spawnProcess = require('../primitives/executeInDir');

module.exports = {
	name: 'on-branch',
	description: 'Only results that are on a given local branch name',
	callback: (targetPath, branchName) =>  spawnProcess(targetPath, ['git', 'rev-parse', '--abbrev-ref', 'HEAD'])
		.then((messages) => messages.length === 1 && (branchName
			? messages[0].data.toString().replace(/\n/gmi, '') === branchName
			: messages[0].data.toString().replace(/\n/gmi, '') !== 'HEAD'))
};