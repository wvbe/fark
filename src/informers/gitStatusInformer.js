const spawnProcess = require('../primitives/executeInDir');

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

	// String[]
	dependencies: ['system'],

	// Describes the information that is retrieved by this informer
	props: [
		{
			name: 'status',
			description: 'A clean or dirty status',
			callback: ({isGit, gitChanges }) => !isGit ?
                null :
                (gitChanges
                    .reduce((letters, change) => letters + change.type, '')
                    .split('')
                    .sort()
                    .filter((a,i,aa) => aa.indexOf(a) === i)
                    .join('') || 'clean')
		}
	],

	// Should return Object or Promise.<Object>
	retrieve: ({ isGit, path }) => isGit ?
		spawnProcess(path, ['git', 'status', '--porcelain'])
			.then((messages) => ({
				isGitClean: !!messages.length,
                gitChanges: messages
					.reduce((lines, message) => lines.concat(message.data.split('\n')), [])
                    .filter(line => !!line)
					.map(line => {
						const [type, file] = getWordsOrQuotedPhrases(line);
						return { type, file };
					})
            })) :
		{ isGitClean: false, gitChanges: [] },

	// A list of filters that can be applied on prop values using $ fark --filters filter-name:arg1:arg2
	filters: [
		{
			name: 'is-git',
			description: 'Only git projects',
			callback: ({ isGit }) => isGit
		},
		{
			name: 'status',
			description: 'filter by clean, dirty, or any combination of ? (unstaged), a (added), M (modded) or D (deleted)',
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
					.split('')
					.some(changeType => gitChanges
						.some(gitChange => changeType.toLowerCase() === gitChange.type.toLowerCase())
					);
			}
		},
		...([
			{ flag: '?', name: 'unstaged' },
			{ flag: 'A', name: 'addition' },
			{ flag: 'D', name: 'deletion' },
			{ flag: 'M', name: 'modification' }
		].map(chagneType => ({
			name: 'has-' + chagneType.name,
			description: 'Wether the repository has any, or a specific file marked as ' + chagneType.name,
			callback: ({ isGit, gitChanges }, fileName) => fileName ?
				gitChanges.some(change => change.type.includes(chagneType.flag) && change.file === fileName) :
				gitChanges.some(change => change.type.includes(chagneType.flag))
		})))
	]
};
