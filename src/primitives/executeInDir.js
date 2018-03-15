'use strict';

const spawn = require('cross-spawn-async');

module.exports = (cwd, argv, log) => {
	const logAllTheThings = (allTheThings, time) => {
		log.caption(`${cwd}`);

		allTheThings.forEach(thing => {
			thing.data.split('\n').forEach(log[thing.type].bind(log));
		});

		log.debug(`Exited after ${time} ms`);
	};

	return new Promise((resolve, reject) => {
		const processMessages = [];
		const timeStart = new Date().getTime();
		let cancelled = false;
		const spawnedProcess = spawn(argv[0], argv.slice(1), { cwd: cwd });

		//if(log) {
		spawnedProcess.stdout.on('data', (data) => processMessages.push({ type: 'debug',  data: data.toString().trim() }));
		spawnedProcess.stderr.on('data', (data) => processMessages.push({ type: 'notice', data: data.toString().trim() }));
		//}

		spawnedProcess.on('error', (error) => {
			if (log) {
				processMessages.push({ type: 'error', data: error.message || error.code || 'Process exited with an unknown error' });
				logAllTheThings(processMessages, new Date().getTime() - timeStart);
			}
			cancelled = true;

			reject(error);

			spawnedProcess.removeAllListeners();
		});

		spawnedProcess.on('close', () => {
			// If cancelled, do not resolve() because  it was already rejected
			if(cancelled)
				return;

			if (log)
				logAllTheThings(processMessages, new Date().getTime() - timeStart);

			resolve(processMessages);
		});
	});
}
