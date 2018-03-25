const path = require('path');
const fs = require('fs');
module.exports = {
	name: 'system',

	// String[]
	dependencies: [],

	// Describes the information that is retrieved by this informer
	props: {
		path: 'The full path to repo',
		name: 'The directory name',
		isGit: 'This is a git versioned repository'
	},

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
			name: 'dir-starts-with',
			description: 'Only repositories whose directory starts with $1',
			callback: (info, query) => info.basename.indexOf(query) === 0
		}
	]
};
