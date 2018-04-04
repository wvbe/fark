const timeStart = Date.now();

const { Command, MultiOption, IsolatedOption } = require('ask-nicely');
const glob = require('glob');
const util = require('util');
const { table } = require('table');

const helpController = require('./primitives/helpController');
const InformerPool = require('./informers/InformerPool');
const app = new Command();

const informerPool = new InformerPool([
	require('./informers/systemInformer'),
	require('./informers/gitStatusInformer')
]);

app.addOption(new IsolatedOption('help').setShort('h').setDescription('Shows you this help page'));

app.addPreController(req => {
	if (req.options.help) {
		helpController(req);
		return false;
	}
});

app.addOption(new MultiOption('filters').setShort('f').setDescription('For example "status:dirty".'));

app.addOption(new MultiOption('props').setShort('p').setDescription('Additional properties to show').setDefault(['name', 'status'], true));


app.setController(req => util.promisify(glob)('./*/', {})
	.then(directories => {
		const filters = req.options.filters.map(filter => filter.split(':')[0].substr(filter.charAt(0) === '~' ? 1 : 0));
		const props = req.options.props;
		const informers = informerPool
			.filter(informer => props.some(prop => informer.props.some(p => p.name === prop)) ||
				filters.some(filter => informer.filters.some(f => f.name === filter)));
		const allInformers = informerPool.resolveDependencies(informers);

		return Promise.all(directories.map(directory => informerPool.runDependencyTree(allInformers, (informer, info) => {
			return informer.retrieve(info, directory);
		})))
	})
	.then(results => {
		const options = {
			drawHorizontalLine: (index, last) => index === 0 || index === 1 || index === last || index === last - 1,
			columns: req.options.props.map(propName => ({
					alignment: 'left',
					minWidth: 10
				}))
				.reduce((columns, col, i) => Object.assign(columns, {
					[i]: col
				}), {})
		};

		const data = results.map(result => req.options.props.map(prop => informerPool.getProp(prop).callback(result)));

		data.splice(0, 0, req.options.props);
		data.push(req.options.props);

		console.log(table(data, options));

		console.log('Directories: ' + results.length);
		console.log('Filters:     ' + (req.options.filters.length ? req.options.filters.join(', ') : '-'));
		console.log('Props:       ' + (req.options.props.length ? req.options.props.join(', ') : req.options.props.length));
		console.log('Time:        ' + (Date.now() - timeStart) + 'ms');
	}));

module.exports = app;
