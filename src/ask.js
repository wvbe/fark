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

app.addOption(new MultiOption('props')
	.setShort('p')
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
			.filter(informer => req.options.props.some(prop => informer.props.includes(prop)) ||
                req.options.filters.some(filter => informer.filters.some(f => f.name === filter.name)));
		const allInformers = informerPool.resolveDependencies(requiredInformers);

		return Promise.all(directories.map(directory => informerPool.runDependencyTree(allInformers, (informer, info) => {
			return informer.retrieve(info, directory);
		})));
	})
	.then(results => {
		// Get, filter and transform the result list for table output
		const data = results
			// Filter results based on the --filter option
			.filter(result => req.options.filters.every(filter => filter.isNegation === !filter.callback(result, ...filter.arguments)))
			// Map to a 2d array
			.map(result => req.options.props.map(prop => prop.callback(result)));

		// Add the column names to the top and bottom of the table
		data.splice(0, 0, req.options.props.map(prop => prop.name));
		data.push(req.options.props.map(prop => prop.name));

		console.group();
		console.log(table(data, Object.assign({}, defaultTableOptions, {
			columns: req.options.props.map(() => ({
				alignment: 'left',
				minWidth: 10
			}))
		})));

		console.groupEnd();
		console.log('  Directories: ' + results.length);
		console.log('  Filters:     ' + (req.options.filters.length ?
			req.options.filters
				.map(filter => (filter.isNegation ? '~' : '') + [filter.name, ...filter.arguments].join(':'))
				.join(', ') :
			'-'));

		console.log('  Props:       ' + (req.options.props.length ?
			req.options.props.map(prop => prop.name).join(', ') :
			req.options.props.length));

		console.log('  Unused props: ' + informerPool.toArray()
			.reduce((propNames, informer) => propNames.concat(informer.props
				.filter(prop => !req.options.props.includes(prop))
				.map(prop => prop.name)
			), [])
			.sort()
			.join(', '));
		console.log('  Time:        ' + (Date.now() - timeStart) + 'ms');
		console.log();
	}));

module.exports = app;
