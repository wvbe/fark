'use strict';

const spawnProcess = require('../primitives/executeInDir');

module.exports = {
	name: 'status',
	description: 'Only results that have a "clean" or "dirty" state',
	callback: (targetPath, state) => spawnProcess(targetPath, ['git', 'status', '--porcelain'])
		.then((messages) => {
			let containsDirtyFiles = messages.some(function filterMessage (message) {
				// recurse to filter messages with multiple lines
				if (Array.isArray(message)) {
					return message.some(filterMessage);
				}

				// if git status (--porcelain) returns anything, it means this app/lib is "dirty"
				return !!message;
			});

			return state === 'dirty' ? containsDirtyFiles : !containsDirtyFiles;
		})
};