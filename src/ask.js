const { Command, MultiOption, IsolatedOption } = require('ask-nicely');
const glob = require('glob');
const util = require('util');

const filterDirectories = require('./primitives/filterDirectories');
const helpController = require('./primitives/helpController');
const InformerPool = require('./informers/InformerPool');
const app = new Command();

const informerPool = new InformerPool([
	require('./informers/systemInformer'),
	require('./informers/gitStatusInformer')
]);

app.addOption(new MultiOption('filters').setShort('f').setDescription('For example "status:dirty".'));
app.addOption(new IsolatedOption('help').setShort('h').setDescription('Shows you this help page'));
app.addOption(new MultiOption('props').setShort('p').setDescription('Additional properties to show'));
app.addPreController(req => {
	if (req.options.help) {
		helpController(req);
		return false;
	}
});

app.setController(req => util.promisify(glob)('./*/', {})
	.then(directories => {
		const filters = req.options.filters.map(filter => filter.split(':')[0].substr(filter.charAt(0) === '~' ? 1 : 0));
		const props = req.options.props;
		const informers = informerPool
			.filter(informer => props.some(prop => informer.props[prop]) ||
				filters.some(filter => informer.filters.some(f => f.name === filter)));
		const allInformers = informerPool.resolveDependencies(informers);
		console.log('FARK');
		console.log('---');
		console.log('  Directories: ' + directories.length);
		console.log('  Filters: ' + filters.join(', '));
		console.log('  Props: ' + props.join(', '));
		console.log('  Informers: ' + informers.map(i => i.name).join(', '));
		console.log('  Dependencies: ' + allInformers.filter(i => !informers.includes(i)).map(i => i.name).join(', '));
		console.log('---');

		console.dir(directories, { depth: 3, colors: true });

		return Promise.all(directories.map(directory => informerPool.runDependencyTree(allInformers, (informer, info) => {
			return informer.retrieve(info, directory);
		})))
	})
	.then(results => {
		console.dir(results, { depth: 3, colors: true });
	}));
	// 	[
	// 		// require('./informers/pathInformer'),
	// 		require('./filters/filterDirStartsWith'),
	// 		require('./filters/filterGitControlled'),
	// 		require('./filters/filterHasBranch'),
	// 		require('./filters/filterHasRemoteBranch'),
	// 		require('./filters/filterHasUntaggedCommits'),
	// 		require('./filters/filterIsCommitsBehind'),
	// 		require('./filters/filterIsOnRemoteHost'),
	// 		require('./filters/filterOnBranch'),
	// 		require('./filters/filterOnRemoteBranch'),
	// 		require('./filters/filterPathContains'),
	// 		require('./filters/filterPushed'),
	// 		require('./filters/filterStatus')
	// 	],
	// 	req.options.filters;
	// ])
	// // .then(args => informOnDirectories(...args))
	// .then(args => filterDirectories(...args))
	// .then(directories => {
	// 	console.dir(directories);
	// 	// @TODO: Apply useful information
	// 	// @TODO: Log to console, json, csv
	// 	// @TODO: Execute and log shell cmds
	// 	return directories;
	// }));

module.exports = app;
