const path = require('path');
const fs = require('fs');

module.exports = {
	name: 'stat',

	// String[]
	dependencies: [],

	// Should return Object or Promise.<Object>
	retrieve: (data, location) => new Promise((res, rej) => fs.lstat(location, (e, stats) => {
		return e ?
			!console.log(e) && rej(e) :
			res({
				fstat: {
					...stats,
					isSymbolicLink: stats.isSymbolicLink()
				}
			});
	})),

	// Describes the information that is retrieved by this informer
	props: [
		{
			name: 'is-link',
			description: 'Symbolic link, or no',
			callback: ({ fstat }) => fstat.isSymbolicLink ? 'yes' : 'no'
		},
		{
			name: 'changed',
			description: 'The last time the file status was changed',
			callback: ({ fstat }) => new Date(fstat.ctime).toDateString()
		},
		{
			name: 'modified',
			description: 'The last time this file was modified',
			callback: ({ fstat }) => new Date(fstat.mtime).toDateString()
		},
		{
			name: 'accessed',
			description: 'The last time this file was accessed',
			callback: ({ fstat }) => new Date(fstat.atime).toDateString()
		},
		// {
		// 	name: 'is-git',
		// 	description: 'This is a git versioned repository',
		// 	callback: ({ isGit }) => isGit ? 'yes' : 'no'
		// }
	],

	// A list of filters that can be applied on prop values using $ fark --filters filter-name:arg1:arg2
	filters: [
		{
			name: 'is-link',
			description: 'Entry is a symbolic link',
			callback: ({ fstat }) => {
				return fstat.isSymbolicLink;
			}
		}
	]
};
