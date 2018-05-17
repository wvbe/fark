const path = require('path');
const fs = require('fs');

module.exports = {
	name: 'npm',

	dependencies: [],

	props: [
		{
			name: 'npm-prop',
			description: 'Property $1 of package.json',
			callback: ({ isNpm, npmPackageJson }, propName) => !isNpm || !propName ? null : npmPackageJson[propName] || null
		},
		// @TODO: Let props in some way easily be converted to filters
		{
			name: 'is-npm-private',
			description: 'Is this a private package',
			// This prop deliberately does not check if package.json is actually valid for npm
			callback: ({ npmPackageJson }) => npmPackageJson.isPrivate ? 'yes' : 'no'
		},
		{
			name: 'is-npm',
			description: 'This is an npm package',
			callback: ({ isNpm }) => isNpm ? 'yes' : 'no'
		}
	],

	retrieve: (info, location) => {
		try {
			const manifest = JSON.parse(fs.readFileSync(path.join(location, 'package.json'), 'utf8'));
			return {
				// isNpm can only be true if the manifest describes the two minimum requirements: name and version
				// https://docs.npmjs.com/getting-started/using-a-package.json
				isNpm: !!manifest.name && manifest.version,
				npmPackageJson: manifest
			}
		} catch (e) {
			return {
				isNpm: false,
			};
		}
	},

	filters: [
		{
			name: 'is-npm',
			describe: 'There is a package.json that makes it an npm package',
			callback: ({ isNpm }) => !!isNpm
		},
		{
			name: 'is-npm-private',
			describe: 'The package is marked as private, not to be published',
			callback: ({ isNpm, npmPackageJson }) => isNpm && npmPackageJson.private
		},
		{
			name: 'has-npm-keyword',
			describe: 'The package has been labelled with keyword $1',
			callback: ({ isNpm, npmPackageJson }, keyword) => isNpm &&
				Array.isArray(npmPackageJson.keywords) &&
				npmPackageJson.keywords.includes(keyword)
		}
	]
};
