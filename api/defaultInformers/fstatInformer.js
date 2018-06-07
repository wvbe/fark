const path = require('path');
const fs = require('fs');

module.exports = {
	name: 'stat',

	dependencies: [
		'system'
	],

	retrieve: (data, location) => new Promise((res, rej) => fs.lstat(location, (e, stats) => {
		return e ?
			rej(e) :
			res({
				fstat: {
					...stats,
					isSymbolicLink: !!stats.isSymbolicLink()
				}
			});
	})),

	props: [
		{
			name: 'is-link',
			type: 'boolean',
			isFilterable: true,
			description: 'Symbolic link, or no',
			callback: ({ fstat }) => fstat.isSymbolicLink
		},
		{
			name: 'changed',
			type: 'date',
			description: 'The last time the file status was changed',
			callback: ({ fstat }) => new Date(fstat.ctime)
		},
		{
			name: 'modified',
			type: 'date',
			description: 'The last time this file was modified',
			callback: ({ fstat }) => new Date(fstat.mtime)
		},
		{
			name: 'accessed',
			type: 'date',
			description: 'The last time this file was accessed',
			callback: ({ fstat }) => new Date(fstat.atime)
		},
		{
			name: 'has-file',
			type: 'boolean',
			isFilterable: true,
			description: 'Assert wether file $1 exists',
			callback: ({ fstat, path: codePath }, filePath) => fs.existsSync(path.join(codePath, filePath))
		}
	]
};
