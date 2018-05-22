const path = require('path');
const fs = require('fs');

module.exports = {
	name: 'stat',

	// String[]
	dependencies: [
		'system'
	],

	// Should return Object or Promise.<Object>
	retrieve: (data, location) => new Promise((res, rej) => fs.lstat(location, (e, stats) => {
		return e ?
			!console.log(e) && rej(e) :
			res({
				fstat: {
					...stats,
					isSymbolicLink: !!stats.isSymbolicLink()
				}
			});
	})),

	// Describes the information that is retrieved by this informer
	props: [
		{
			name: 'is-link',
			type: 'boolean',
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
		}
	],

	// A list of filters that can be applied on prop values using $ fark --filters filter-name:arg1:arg2
	filters: [
		{
			name: 'is-link',
			description: 'Entry is a symbolic link',
			callback: ({ fstat }) => {
				return fstat.isSymbolicLink;
			}
		},
		{
			name: 'has-file',
			description: 'Assert wether file $1 exists',
			callback: ({ fstat, path: codePath }, filePath) => fs.existsSync(path.join(codePath, filePath))
		}
	]
};
