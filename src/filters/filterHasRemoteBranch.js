const spawnProcess = require('../primitives/executeInDir');

module.exports = {
	name: 'has-remote-branch',
	description: 'Only results that have a given branch name remotely',
	callback:(targetPath, branchName) => spawnProcess(targetPath, ['git', 'branch', '-r', '--list', 'origin/' + branchName])
		.then((messages) => messages.length >= 1)
};