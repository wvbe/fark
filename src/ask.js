const timeStart = Date.now();

const glob = require('glob');
const util = require('util');
const { table } = require('table');
const { Command, MultiOption, IsolatedOption } = require('ask-nicely');

const helpController = require('./primitives/helpController');
const InformerPool = require('./informers/InformerPool');

const informerPool = new InformerPool([
	require('./informers/systemInformer'),
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
}
app.setController(req => util.promisify(glob)('./*/', {})
	.then(directories => {
		const filterNames = req.options.filters.map(filter => filter.name);
		const propNames = req.options.props.map(prop => prop.name);
		const requiredInformers = informerPool
			.filter(informer => propNames.some(prop => informer.props.some(p => p.name === prop)) ||
				filterNames.some(filter => informer.filters.some(f => f.name === filter)));
		const allInformers = informerPool.resolveDependencies(requiredInformers);

		return Promise.all(directories.map(directory => informerPool.runDependencyTree(allInformers, (informer, info) => {
			return informer.retrieve(info, directory);
		})));
	})
	.then(results => {
		// Get, filter and transform the result list for table output
		const data = results
			// Filter results based on the --filter option
			.filter(result => req.options.filters.every(filter => filter.callback(result, ...filter.arguments)))
			// Map to a 2d array
			.map(result => req.options.props.map(prop => prop.callback(result)));

		// Add the column names to the top and bottom of the table
		data.splice(0, 0, req.options.props.map(prop => prop.name));
		data.push(req.options.props.map(prop => prop.name));

		console.log(table(data, Object.assign({}, defaultTableOptions, {
			columns: req.options.props.map(() => ({
				alignment: 'left',
				minWidth: 10
			}))
		})));

		console.log('  Directories: ' + results.length);
		console.log('  Filters:     ' + (req.options.filters.length ?
			req.options.filters
				.map(filter => (filter.isNegation ? '~' : '') + [filter.name, ...filter.arguments].join(':'))
				.join(', ') :
			'-'));
		console.log('  Props:       ' + (req.options.props.length ?
			req.options.props.map(prop => prop.name).join(', ') :
			req.options.props.length));
		console.log('  Time:        ' + (Date.now() - timeStart) + 'ms');
		console.log();
	}));

module.exports = app;
