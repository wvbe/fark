'use strict';

module.exports = {
	name: 'path-contains',
	description: 'Only repositories whose full path contains ...',
	callback: (targetPath, prefixString) => Promise.resolve(targetPath.includes(prefixString))
};
