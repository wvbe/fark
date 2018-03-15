const path = require('path');

module.exports = {
	name: 'dir-starts-with',
	description: 'Only repositories whose directory starts with ...',
	callback: (targetPath, prefixString) => Promise.resolve(path.basename(targetPath).indexOf(prefixString) === 0)
};