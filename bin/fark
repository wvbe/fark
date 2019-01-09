#!/usr/bin/env node

const path = require('path');
const os = require('os');
const glob = require('multi-glob').glob;
const fark = require('../api/index');
const farkDir = path.join(os.homedir(), '.fark');

glob(['*Informer.js'], { cwd: farkDir }, (err, fileNames) => {
	if (err) {
		console.error(err);
	}

	fark([
		...fark.defaultInformers,
		...fileNames.map(fileName => require(path.join(farkDir, fileName)))
	])
		.execute(process.argv.slice(2))
		.then(() => {
			process.exit(0);
		})
		.catch(error => {
			console.log();
			console.error(error.message);
			console.log();
			process.exit(1);
		});
});
