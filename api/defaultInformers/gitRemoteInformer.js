const spawnProcess = require('../../src/primitives/executeInDir');

module.exports = {
	name: 'git-remote-status',

	// String[]
	dependencies: ['system'],

	// Describes the information that is retrieved by this informer
	props: [],

	// Should return Object or Promise.<Object>
	retrieve: ({ isGit, path }) => isGit ?
		spawnProcess(path, ['git', 'cherry', '-v'])
			.then((messages) => ({
				hasUnpushedChanges: !!messages.length
			})) :
		{ hasUnpushedChanges: false },

	// A list of filters that can be applied on prop values using $ fark --filters filter-name:arg1:arg2
	filters: [
		{
			name: 'is-git-ahead',
			description: 'The repository has a commit that has not been pushed to remote.',
			callback: ({ hasUnpushedChanges }) => {
				return !!hasUnpushedChanges;
			}
		}
	]
};
