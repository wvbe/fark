const path = require('path');
const fs = require('fs');

module.exports = {
	name: 'system',

	// String[]
	dependencies: [],

	// Describes the information that is retrieved by this informer
	props: [
		{
			name: 'path',
			description: 'The full path to repo',
			callback: ({ path }) => path
		},
		{
			name: 'name',
			description: 'The directory name',
			callback: ({ name }) => name
		},
		{
			name: 'is-git',
			description: 'This is a git versioned repository',
			callback: ({ isGit }) => isGit ? 'yes' : 'no'
		}
	],

	// Should return Object or Promise.<Object>
	retrieve: (_info, location) => ({
		path: path.resolve(process.cwd(), location),
		name: path.basename(location),
		isGit: fs.existsSync(path.resolve(location, '.git'))
	}),

	// A list of filters that can be applied on prop values using $ fark --filters filter-name:arg1:arg2
	filters: [
		{
			name: 'is-git-controlled',
			callback: ({ isGit }) => isGit
		},
		{
			name: 'path-contains',
			description: 'Only repositories whose full path contains $1',
			callback: (info, query) => info.path.includes(query)
		},
		{
			name: 'name-starts-with',
			description: 'Only repositories whose directory starts with $1',
			callback: (info, query) => info.name.indexOf(query) === 0
		}
	]
};
