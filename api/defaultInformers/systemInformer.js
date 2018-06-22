const path = require('path');
const fs = require('fs');

const propTypeString = require('../propTypes/string');
const propTypeBoolean = require('../propTypes/boolean');
const propTypeDate = require('../propTypes/date');

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
			type: propTypeString,
			description: 'The full path to repo',
			callback: ({ path }) => path || null
		},
		{
			name: 'name',
			type: propTypeString,
			description: 'The directory name',
			callback: ({ name }) => name || null
		},
		{
			name: 'is-git',
			type: propTypeBoolean,
			isFilterable: true,
			description: 'This is a git versioned repository',
			callback: ({ isGit }) => !!isGit
		},
		{
			name: 'path-contains',
			type: propTypeBoolean,
			isFilterable: true,
			description: 'Only repositories whose full path contains $1',
			callback: ({ path }, query) => path.includes(query)
		},
		{
			name: 'name-starts-with',
			type: propTypeBoolean,
			isFilterable: true,
			description: 'Only repositories whose directory starts with $1',
			callback: ({ name }, query) => name.indexOf(query) === 0
		}
	]
};
