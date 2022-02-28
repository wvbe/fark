const spawnProcess = require('../../src/primitives/executeInDir');
const os = require('os');
const propTypeBoolean = require('../propTypes/boolean');
const propTypeString = require('../propTypes/string');

module.exports = {
	name: 'git-remote-host',

	dependencies: ['system'],

	retrieve: ({ isGit, path }) =>
		isGit
			? spawnProcess(path, ['git', 'remote', 'show'])
					.then(messages => {
						// Get the list of remote names
						const remoteNames = messages.reduce(
							(list, message) => list.concat(message.data.trim().split('\n')),
							[]
						);

						// Perform "git config --get remote.origin.url" for every remote name
						return (
							Promise.all(
								remoteNames.map(remoteName =>
									spawnProcess(path, [
										'git',
										'config',
										'--get',
										'remote.' + remoteName + '.url'
									]).then(messages =>
										messages.reduce(
											(text, message) => text + message.data.trim(),
											[]
										)
									)
								)
							)

								// Combine the list of origin names and URLs into an object
								.then(urls =>
									remoteNames.reduce(
										(remotes, remoteName, i) =>
											Object.assign(remotes, {
												[remoteName]: urls[i]
											}),
										{}
									)
								)
						);
					})

					// Write the collected object to the "gitRemotes" property so props/filters and other informers can
					// access it.
					.then(gitRemotes => ({
						gitRemotes
					}))
			: {
					gitRemotes: {}
			  },

	props: [
		{
			name: 'git-remote-names',
			type: propTypeString,
			description: 'The names of repository git remotes',
			callback: ({ gitRemotes }) => Object.keys(gitRemotes).join(', ')
		},
		{
			name: 'git-remote-urls',
			type: propTypeString,
			description: 'The URLs of repository git remotes',
			callback: ({ gitRemotes }) =>
				Object.keys(gitRemotes)
					.map(remoteName => gitRemotes[remoteName])
					.join(', ')
		},
		{
			name: 'git-remote-url',
			type: propTypeString,
			description: 'The URL of a specific git remote',
			callback: ({ gitRemotes }, remoteName) => gitRemotes[remoteName]
		}
	]
};
