const spawnProcess = require('../../src/primitives/executeInDir');

const propTypeString = require('../propTypes/string');
const propTypeBoolean = require('../propTypes/boolean');
const propTypeDate = require('../propTypes/date');

function getWordsOrQuotedPhrases (myString) {
	//The parenthesis in the regex creates a captured group within the quotes
	const pattern = /[^\s"]+|"([^"]*)"/gi;
	const results = [];

	let match = pattern.exec(myString);
	while (match !== null) {
		results.push(match[1] || match[0]);
		match = pattern.exec(myString);
	}

	return results;
}

module.exports = {
	name: 'git-status',

	dependencies: ['system'],

	retrieve: ({ isGit, path }) => isGit ?
		spawnProcess(path, ['git', 'status', '--porcelain'])
			.then((messages) => ({
				isGitClean: !!messages.length,
				gitChanges: messages
					.reduce((lines, message) => lines + message.data, '')
					.split('\n')
					.filter(line => !!line)
					.map(line => {
						const [type, file] = getWordsOrQuotedPhrases(line);
						return { type, file };
					})
			})) :
		{ isGitClean: false, gitChanges: [] },

	props: [
		...([
			{ flag: '?', name: 'unstaged' },
			{ flag: 'A', name: 'addition' },
			{ flag: 'D', name: 'deletion' },
			{ flag: 'M', name: 'modification' }
		].map(chagneType => ({
			name: 'has-' + chagneType.name,
			type: propTypeBoolean,
			isFilterable: true,
			description: 'Wether the repository has any, or a file $1 marked as ' + chagneType.name,
			callback: ({ isGit, gitChanges }, fileName) => fileName ?
				gitChanges.some(change => change.type.includes(chagneType.flag) && change.file === fileName) :
				gitChanges.some(change => change.type.includes(chagneType.flag))
		}))),

		{
			name: 'status',
			type: propTypeString,
			description: 'Clean status, or any combination of (U) unstaged, (A) additions, (M) modifications and (D) deletions.',
			callback: ({isGit, gitChanges }) => !isGit ?
				null :
				(gitChanges
					.reduce((letters, change) => letters + change.type, '')
					.split('')
					.sort()
					.filter((a,i,aa) => aa.indexOf(a) === i)
					.join('')
					.replace('?', 'U') || null)
		}
	],

	filters: [
		{
			name: 'status',
			description: 'filter by clean, dirty, or any combination of U (unstaged), A (added), M (modded) or D (deleted)',
			callback: ({ isGit, isGitClean, gitChanges }, state) => {
				if (!isGit) {
					// The object is not in git at all
					return false;
				}

				if (!state) {
					// The filter was applied without an argument ("clean", "dirty", etc)
					return true;
				}

				if (state === 'clean') {
					// User wants clean repos
					return !gitChanges.length;
				}

				if (state === 'dirty') {
					return !!gitChanges.length;
				}

				// If the input were to be "md", would match all repos that has either a modification or deletion
				return state
					.toLowerCase()
					.replace('u', '?')
					.split('')
					.some(changeType => gitChanges
						.some(gitChange => changeType === gitChange.type.toLowerCase())
					);
			}
		}
	]
};
