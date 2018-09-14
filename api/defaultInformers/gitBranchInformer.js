const spawnProcess = require('../../src/primitives/executeInDir');
const propTypeString = require('../propTypes/string');
const propTypeBoolean = require('../propTypes/boolean');

function createObjectForBranchOutputLine (line) {
	if (!line.trim()) {
		return;
	}

	if (line.includes('remotes/origin/HEAD')) {
		return;
	}

	const isCheckedOut = line.startsWith('* ');
	const namePieces = line.substr(2).trim().split('/');

	// This is a pretty crude detect, its possible to name local branches as "remotes/derp"
	const isRemote = namePieces[0] === 'remotes' && namePieces[1] && namePieces[2];

	return {
		branchName: isRemote ? namePieces.slice(2).join('/') : namePieces.join('/'),
		remoteName: isRemote ? namePieces[1] : null,
		isCheckedOut
	}
}

module.exports = {
	name: 'git-branch',

	dependencies: ['system'],

	retrieve: ({ isGit, path }) => isGit ?
		spawnProcess(path, ['git', 'branch', '--list', '--no-color', '--all']).then((messages) => ({
			gitBranches: messages.reduce((branches, message) => branches
				.concat(message.data.split('\n')
				.map(createObjectForBranchOutputLine)
				.filter(b => !!b)
			), [])
		})) :
		{ gitBranches: [] },

	props: [
		{
			name: 'git-branch',
			type: propTypeString,
			description: 'The branch name that is currently checked out',
			callback: ({ gitBranches }) => {
				const current = gitBranches.find(info => info.isCheckedOut);
				return current ? current.branchName : null;
			}
		},
		{
			name: 'has-local-branch',
			type: propTypeBoolean,
			isFilterable: true,
			description: 'Assert wether $1 is a branch on the local machine',
			callback: ({ gitBranches }, branchName) => gitBranches.find(info => (
				!info.remoteName &&
				info.branchName === branchName
			))
		},
		{
			name: 'has-remote-branch',
			type: propTypeBoolean,
			isFilterable: true,
			description: 'Assert wether $1 is a branch on any of the remotes',
			callback: ({ gitBranches }, branchName) => gitBranches.find(info => (
				!!info.remoteName &&
				info.branchName === branchName
			))
		},
		{
			name: 'has-branch',
			type: propTypeBoolean,
			isFilterable: true,
			description: 'Assert wether $1 is a branch on the local machine or any of the remotes',
			callback: ({ gitBranches }, branchName) => gitBranches.find(info => (
				info.branchName === branchName
			))
		}
	]
};
