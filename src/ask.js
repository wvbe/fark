const { Command, MultiOption } = require('ask-nicely');
const glob = require('glob');
const util = require('util');

const filterDirectories = require('./primitives/filterDirectories');

const app = new Command();

app.addOption(new MultiOption('filters').setShort('f'));

app.setController(req => Promise.all([
		util.promisify(glob)('./*/', {}),
		[
			require('./filters/filterDirStartsWith'),
			require('./filters/filterGitControlled'),
			require('./filters/filterHasBranch'),
			require('./filters/filterHasRemoteBranch'),
			require('./filters/filterHasUntaggedCommits'),
			require('./filters/filterIsCommitsBehind'),
			require('./filters/filterIsOnRemoteHost'),
			require('./filters/filterOnBranch'),
			require('./filters/filterOnRemoteBranch'),
			require('./filters/filterPathContains'),
			require('./filters/filterPushed'),
			require('./filters/filterStatus')
		],
		req.options.filters
	])
	.then(args => filterDirectories(...args))
	.then(directories => {
		// @TODO: Apply useful information
		// @TODO: Log to console, json, csv
		// @TODO: Execute and log shell cmds
		return directories;
	});

module.exports = app;
