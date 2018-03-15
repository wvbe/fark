const spawnProcess = require('../primitives/executeInDir');

module.exports = {
	name: 'has-branch',
	description: 'Only results that have a given branch name locally',
	callback: (targetPath, branchName) => spawnProcess(targetPath, ['git', 'branch', '--list', branchName])
		.then((messages) => messages.length >= 1)
};