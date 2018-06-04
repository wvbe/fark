const path = require('path');
const fs = require('fs');

module.exports = {
	name: 'system',

	dependencies: [],

	retrieve: (_info, location) => ({
		path: path.resolve(process.cwd(), location),
		name: path.basename(location),
		isGit: fs.existsSync(path.resolve(location, '.git'))
	}),

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
			isFilterable: true,
			description: 'This is a git versioned repository',
			callback: ({ isGit }) => !!isGit
		},
		{
			name: 'path-contains',
			type: 'boolean',
			isFilterable: true,
			description: 'Only repositories whose full path contains $1',
			callback: ({ path }, query) => path.includes(query)
		},
		{
			name: 'name-starts-with',
			type: 'boolean',
			isFilterable: true,
			description: 'Only repositories whose directory starts with $1',
			callback: ({ name }, query) => name.indexOf(query) === 0
		}
	]
};
