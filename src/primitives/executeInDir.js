'use strict';

const spawn = require('cross-spawn');

module.exports = (cwd, argv) => {
	return new Promise((resolve, reject) => {
		const processMessages = [];
		const spawnedProcess = spawn(argv[0], argv.slice(1), { cwd: cwd });

		spawnedProcess.stdout.on('data', (data) => processMessages.push({
			time: Date.now(),
			type: 'stdout',
			data: data.toString()
		}));

		spawnedProcess.stderr.on('data', (data) => processMessages.push({
			time: Date.now(),
			type: 'stderr',
			data: data.toString()
		}));

		let cancelled = false;
		spawnedProcess.on('error', (error) => {
			processMessages.push({
				time: Date.now(),
				type: 'error',
				data: error.message || error.code || 'Process exited with an unknown error'
			});

			cancelled = true;

			spawnedProcess.removeAllListeners();

			reject(error);
		});

		spawnedProcess.on('close', () => {
			// If cancelled, do not resolve() because  it was already rejected
			if(cancelled) {
				return;
			}

			resolve(processMessages);
		});
	});
};
