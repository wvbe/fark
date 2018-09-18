const spawnProcess = require('../../src/primitives/executeInDir');

const propTypeBoolean = require('../propTypes/boolean');
const propTypeString = require('../propTypes/string');

module.exports = {
	name: 'git-remote-status',

	dependencies: ['system'],

	retrieve: ({ isGit, path }) => isGit ?
		spawnProcess(path, ['git', 'rev-list', '--left-right', '--count', 'HEAD...origin/HEAD'])
			.then((messages) => {
				if (messages.find(m => m.type === 'stderr')) {
					return {
						commitsAhead: null,
						commitsBehind: null
					}
				}

				const [ahead, behind] = messages[0].data.split(/\s*/).map(num => parseInt(num, 10));

				return {
					commitsAhead: ahead,
					commitsBehind: behind
				};
			}) :
		{
			commitsAhead: null,
			commitsBehind: null
		},

	props: [
		{
			name: 'remote-status',
			type: propTypeString,
			description: 'The number of commits ahead and behind on the tracked remote branch',
			callback: ({ commitsAhead, commitsBehind }) => [
				'+' + (commitsAhead === null ? '?' : commitsAhead),
				'-' + (commitsBehind === null ? '?' : commitsBehind)
			].join(' ')
		},
		{
			name: 'is-git-ahead',
			isFilterable: true,
			type: propTypeBoolean,
			description: 'The repository has a commit that has not been pushed to remote.',
			callback: ({ commitsAhead }) => {
				return !!commitsAhead;
			}
		},
		{
			name: 'is-git-behind',
			isFilterable: true,
			type: propTypeBoolean,
			description: 'The remote has a commit that has not been pulled.',
			callback: ({ commitsAhead }) => {
				return !!commitsAhead;
			}
		}
	]
};
