#!/usr/bin/env node

const fark = require('../api/index');
fark(fark.defaultInformers)
	.execute(process.argv.slice(2))
	.then(() => {
		process.exit(0);
	})
	.catch(error => {
		// Errors that occur in informers are thrown all the way over here.
		console.log(error);
		process.exit(1);
	});
