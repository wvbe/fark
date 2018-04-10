const timeStart = Date.now();

const glob = require('glob');
const util = require('util');
const { table } = require('table');
const { Command, MultiOption, IsolatedOption } = require('ask-nicely');

const helpController = require('./primitives/helpController');
const InformerPool = require('./informers/InformerPool');

const informerPool = new InformerPool([
	require('./informers/fstatInformer'),
	require('./informers/systemInformer'),
	require('./informers/npmInformer'),
	require('./informers/gitStatusInformer')
]);

const app = new Command();

app.addOption(new IsolatedOption('help')
	.setShort('h')
	.setDescription('Shows you this help page')
);

app.addPreController(req => {
	if (req.options.help) {
		helpController(req);
		return false;
	}
});

app.addOption(new MultiOption('filters')
	.setShort('f')
	.setDescription('For example "status:dirty".')
	.setResolver(filters => filters.map(filter => {
		const isNegation = filter.charAt(0) === '~';
		const [name, ...arguments] = filter.substr(isNegation ? 1 : 0).split(':');
		return {
			...informerPool.getFilter(name),
			arguments,
			isNegation
		};
	}))
);

app.addOption('sort', 's', 'Sort on this column. Use the negation character ("~") to inversely sort. Defaults to the first column.');

app.addOption(new MultiOption('columns')
	.setShort('c')
	.setDescription('Additional properties to show')
	.setDefault(['name', 'status'], true)
	.setResolver(props => props.map(prop => informerPool.getProp(prop)))
);

const defaultTableOptions = {
	drawHorizontalLine: (index, last) => index === 0 || index === 1 || index === last || index === last - 1
};

app.setController(req => util.promisify(glob)('./*/', {})
	.then(directories => {
		const requiredInformers = informerPool
			.toArray()
			.filter(informer => req.options.columns.some(prop => informer.props.includes(prop)) ||
                req.options.filters.some(filter => informer.filters.some(f => f.name === filter.name)));
		const allInformers = informerPool.resolveDependencies(requiredInformers);

		return Promise.all(directories.map(directory => informerPool.runDependencyTree(allInformers, (informer, info) => {
			return informer.retrieve(info, directory);
		})));
	})
	.then(results => {
		// Prepare some info for sorting results
		const sortInverse = req.options.sort && req.options.sort.charAt(0) === '~';
		const sortColumnName = req.options.sort && req.options.sort.substr(sortInverse ? 1 : 0);
		const sortIndex = Math.max(sortColumnName ?
			req.options.columns.findIndex(column => column.name === sortColumnName) :
			0, 0);

		// Get, filter and transform the result list for table output
		const data = results
			// Filter results based on the --filter option
			.filter(result => req.options.filters.every(filter => filter.isNegation === !filter.callback(result, ...filter.arguments)))
			// Map to a 2d array
			.map(result => req.options.columns.map(prop => prop.callback(result)))
			.sort((a, b) => (sortInverse ? b : a)[sortIndex].localeCompare((sortInverse ? a : b)[sortIndex]));


		// Add the column names to the top and bottom of the table
		data.splice(0, 0, req.options.columns.map(prop => prop.name));
		data.push(req.options.columns.map(prop => prop.name));

		console.group();
		console.log(table(data, Object.assign({}, defaultTableOptions, {
			columns: req.options.columns.map(() => ({
				alignment: 'left',
				minWidth: 10
			}))
		})));
		console.groupEnd();

		const stats = {
			directories: results.length,
			filterNames: req.options.filters.length ?
				req.options.filters
					.map(filter => (filter.isNegation ? '~' : '') + [filter.name, ...filter.arguments].join(':'))
					.join(', ') :
				'-',
			propNames: req.options.columns.length ?
				req.options.columns.map(prop => prop.name).join(', ') :
				req.options.columns.length,
			unusedPropNames: informerPool.toArray()
				.reduce((propNames, informer) => propNames.concat(informer.props
					.filter(prop => !req.options.columns.includes(prop))
					.map(prop => prop.name)
				), [])
				.sort()
				.join(', '),
			time: (Date.now() - timeStart) + 'ms'
		};
		console.log('  Directories:  ' + stats.directories);
		console.log('  Filters:      ' + stats.filterNames);
		console.log('  Props:        ' + stats.propNames);
		console.log('  Unused props: ' + stats.unusedPropNames);
		console.log('  Time:         ' + stats.time);
		console.log();
	}));

module.exports = app;
