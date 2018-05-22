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
			type: 'string',
			description: 'The full path to repo',
			callback: ({ path }) => path || null
		},
		{
			name: 'name',
			type: 'string',
			description: 'The directory name',
			callback: ({ name }) => name || null
		},
		{
			name: 'is-git',
			type: 'boolean',
			description: 'This is a git versioned repository',
			callback: ({ isGit }) => !!isGit
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
			name: 'is-git',
			description: 'Only repositories versioned in git',
			callback: ({ isGit }) => isGit
		},
		{
			name: 'path-contains',
			description: 'Only repositories whose full path contains $1',
			callback: ({ path }, query) => path.includes(query)
		},
		{
			name: 'name-starts-with',
			description: 'Only repositories whose directory starts with $1',
			callback: ({ name }, query) => name.indexOf(query) === 0
		}
	]
};
