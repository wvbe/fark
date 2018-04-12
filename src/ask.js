const timeStart = Date.now();

const glob = require('glob');
const util = require('util');
const { table } = require('table');
const { Command, MultiOption, IsolatedOption } = require('ask-nicely');

const executeInDir = require('./primitives/executeInDir');
const helpController = require('./primitives/helpController');
const InformerPool = require('./informers/InformerPool');

const informerPool = new InformerPool([
	require('./informers/fstatInformer'),
	require('./informers/systemInformer'),
	require('./informers/npmInformer'),
	require('./informers/gitStatusInformer')
]);

const app = new Command();

/*
	The --help flag
*/
app.addOption(new IsolatedOption('help')
	.setShort('h')
	.setDescription('Shows you this help page')
);

const NO_NAME = '<no name>',
	NO_DESCRIPTION = '<no description>',
	NONE = '<none>';

function concatAllOfAncestors (command, propertyName) {
	return (command.parent
		? concatAllOfAncestors(command.parent, propertyName)
		: []).concat(command[propertyName]);
}

app.addPreController(req => {
	if (!req.options.help) {
		return;
	}

	let command = req.command;

	console.log(``);
	// console.log(`Name:            ${command.name || NO_NAME}`);
	// console.log(`Description:     ${command.description || NO_DESCRIPTION}`);
	//
	// console.log(`Child commands:  ${command.children.length || NONE}`);
	// command.children
	// 	.sort((a, b) => a.name.localeCompare(b.name))
	// 	.forEach(cmd =>{
	// 		console.log(`    ${cmd.name}    ${cmd.description || NO_DESCRIPTION}`);
	// 	});
	//
	// let parameters = concatAllOfAncestors(command, 'parameters');
	// console.log(`Parameters:      ${parameters.length || NONE}`);
	// parameters
	// 	.forEach(param => {
	// 		console.log(`    {${param.name}}    ${param.description || NO_DESCRIPTION}`);
	// 	});

	let options = concatAllOfAncestors(command, 'options');
	console.log(`Options:         ${options.length || NONE}`);
	options
		.sort((a, b) => a.name.localeCompare(b.name))
		.forEach(option => {
			console.log([
				'',
				option.short ? '-' + option.short : '  ',
				'--' + option.name,
				option.required ? '* ' : '' + (option.description || NO_DESCRIPTION)
			].join('    '));
		});

	let props = informerPool
		.toArray()
		.reduce((propNames, informer) => propNames.concat(informer.props), []);
	console.log(`Columns:         ${props.length || NONE}`);
	props
		.sort((a, b) => a.name.localeCompare(b.name))
		.forEach(option => {
			console.log([
				'',
				option.name,
				option.description || NO_DESCRIPTION
			].join('    '));
		});


	let filters = informerPool
		.toArray()
		.reduce((propNames, informer) => propNames.concat(informer.filters), []);
	console.log(`Filters:         ${filters.length || NONE}`);
	filters
		.sort((a, b) => a.name.localeCompare(b.name))
		.forEach(filter => {
			console.log([
				'',
				filter.name,
				filter.description || NO_DESCRIPTION
			].join('    '));
		});


	console.log(``);

	return false;
});

/*
	Normal use
*/
app.addOption(new MultiOption('filters')
	.setShort('f')
	.setDescription('Show only results that match all given filters. Use "~" to invert the filter response, and ":" for additional filter arguments.')
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
	.setDescription('Additional properties to show for each directory.')
	.setDefault(['name', 'status'], true)
	.setResolver(props => props.map(prop => informerPool.getProp(prop)))
);
app.addOption(new MultiOption('run')
	.setShort('$')
	.setDescription('Run this command in every result directory')
	.isInfinite(true));

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

	// Filter irrelevant results based on the --filter option
	.then(results => results.filter(result => req.options.filters.every(filter => filter.isNegation === !filter.callback(result, ...filter.arguments))))

	.then(results => {
		// Prepare some info for sorting results
		const sortInverse = req.options.sort && req.options.sort.charAt(0) === '~';
		const sortColumnName = req.options.sort && req.options.sort.substr(sortInverse ? 1 : 0);
		const sortIndex = Math.max(sortColumnName ?
			req.options.columns.findIndex(column => column.name === sortColumnName) :
			0, 0);

		const data = results
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

		if (req.options.run.length) {
			return results.reduce((deferred, result) => {
				return deferred.then(() => executeInDir(result.path, req.options.run))
					.then(messages => {
						console.log(result.path);
						console.group();
						messages.forEach(message => console[message.type === 'stdout' ? 'error' : 'log'](message.data));
						console.groupEnd();
					});
			}, Promise.resolve());
		}
	}));

module.exports = app;
