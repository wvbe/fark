const spawnProcess = require('../../src/primitives/executeInDir');

const propTypeBoolean = require('../propTypes/boolean');

module.exports = {
	name: 'git-remote-status',

	dependencies: ['system'],

	retrieve: ({ isGit, path }) => isGit ?
		spawnProcess(path, ['git', 'rev-list', '--left-right', '--count', 'HEAD...origin/HEAD'])
			.then((messages) => ({
				hasUnpushedChanges: !messages[0].data.startsWith('0')
			})) :
		{ hasUnpushedChanges: false },

	props: [
		{
			name: 'is-git-ahead',
			isFilterable: true,
			type: propTypeBoolean,
			description: 'The repository has a commit that has not been pushed to remote.',
			callback: ({ hasUnpushedChanges }) => {
				return !!hasUnpushedChanges;
			}
		}
	]
};
