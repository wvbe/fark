const path = require('path');
const fs = require('fs');

module.exports = {
	name: 'npm',

	// String[]
	dependencies: [
	//	'system'
	],

	// Describes the information that is retrieved by this informer
	props: [
		{
			name: 'npm:version',
			description: 'The version number in package.json',
			callback: ({ isNpm, npmPackageJson }) => isNpm && npmPackageJson.version || null
		},
		{
			name: 'is-npm',
			description: 'The directory name',
			callback: ({ isNpm }) => isNpm ? 'yes' : 'no'
		}
	],

	// Should return Object or Promise.<Object>
	retrieve: (info, location) => {
		try {
			const manifest = JSON.parse(fs.readFileSync(path.join(location, 'package.json'), 'utf8'));
			return {
				isNpm: true,
				npmPackageJson: manifest
			}
		} catch (e) {
			return {
				isNpm: false,
			};
		}
	},

	// A list of filters that can be applied on prop values using $ fark --filters filter-name:arg1:arg2
	filters: [
		{
			name: 'is-npm',
			callback: ({ isNpm }) => !!isNpm
		}
	]
};
