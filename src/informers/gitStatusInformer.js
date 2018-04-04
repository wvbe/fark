const spawnProcess = require('../primitives/executeInDir');

module.exports = {
	name: 'git-status',

	// String[]
	dependencies: ['system'],

	// Describes the information that is retrieved by this informer
	props: [
		{
			name: 'status',
			description: 'A clean or dirty status',
			callback: ({ isGitClean }) => isGitClean ? 'clean' : 'dirty'
		}
	],

	// Should return Object or Promise.<Object>
	retrieve: ({ isGit, path }) => isGit ?
		spawnProcess(path, ['git', 'status', '--porcelain']).then((messages) => ({
			isGitClean: !messages.length
		})) :
		{ isGitClean: false },

	// A list of filters that can be applied on prop values using $ fark --filters filter-name:arg1:arg2
	filters: [
		{
			name: 'status',
			callback: ({ isGitClean }, state) => state === 'dirty' ? !isGitClean : isGitClean
		}
	]
};
