const spawnProcess = require('../primitives/executeInDir');

const getStatus = ({ isGit, isGitClean }) => !isGit ? null : isGitClean ? 'clean' : 'dirty';

module.exports = {
	name: 'git-status',

	// String[]
	dependencies: ['system'],

	// Describes the information that is retrieved by this informer
	props: [
		{
			name: 'status',
			description: 'A clean or dirty status',
			callback: getStatus
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
			name: 'is-git',
			callback: ({ isGit }) => isGit
		},
		{
			name: 'status',
			callback: (info, state) => {
				if (!state) {
					return info.isGit
				}
				return state === getStatus(info);
			}
		}
	]
};
