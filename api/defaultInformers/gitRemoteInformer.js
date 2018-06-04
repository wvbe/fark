const spawnProcess = require('../../src/primitives/executeInDir');

module.exports = {
	name: 'git-remote-status',

	dependencies: ['system'],

	retrieve: ({ isGit, path }) => isGit ?
		spawnProcess(path, ['git', 'cherry', '-v'])
			.then((messages) => ({
				hasUnpushedChanges: !!messages.length
			})) :
		{ hasUnpushedChanges: false },

	props: [
		{
			name: 'is-git-ahead',
			isFilterable: true,
			type: 'boolean',
			description: 'The repository has a commit that has not been pushed to remote.',
			callback: ({ hasUnpushedChanges }) => {
				return !!hasUnpushedChanges;
			}
		}
	]
};
