const fs = require('fs');
const path = require('path');

module.exports = {
	system: true,
	name: 'is-git-controlled',
	description: 'This filter is always on and therefore hard-coded',
	callback: targetPath => new Promise(res => fs.stat(path.resolve(targetPath, '.git'), (err) => res(!err)))
};
