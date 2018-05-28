const spawnProcess = require('../../src/primitives/executeInDir');

module.exports = {
	name: 'git-branch',

	dependencies: ['system'],

	props: [
		{
			name: 'git-branch',
			type: 'string',
			description: 'The branch name that is currently checked out',
			callback: ({ gitLocalBranches }) => {
				const current = gitLocalBranches.find(info => info.checkedOut);
				console.dir(current);
				return current ? current.name : null;
			}
		}
	],

	retrieve: ({ isGit, path }) => isGit ?
		spawnProcess(path, ['git', 'branch', '--list', '--no-color']).then((messages) => ({
			gitLocalBranches: messages.reduce((branches, message) => branches
				.concat(message.data
					.split('\n')
					.filter(line => !!line.trim())
					.map(line => ({
						name: line.substr(2).trim(),
						checkedOut: line.indexOf('* ') === 0
					}))
				), [])
		})) :
		{ gitLocalBranches: [] },

	filters: []
};
