const timeStart = Date.now();

const glob = require('multi-glob').glob;
const { table } = require('table');
const { Command, Option, MultiOption, IsolatedOption } = require('ask-nicely');
const InformerPool = require('./informers/InformerPool');
const executeInDir = require('./primitives/executeInDir');
const getResults = require('./primitives/getResults');
const logTheHelpPage = require('./shenanigans/logTheHelpPage');

function consoleLogTable(columns, data) {
	// Add the column names to the top and bottom of the table
	data.splice(0, 0, columns);
	data.push(columns);

	console.log(table(data, {
		drawHorizontalLine: (index, last) => index === 0 || index === 1 || index === last || index === last - 1,
		columns: columns.map(() => ({
			alignment: 'left',
			wrapWord: true
		}))
	}));
}


module.exports = (informers = []) => {
	const informerPool = new InformerPool(informers);

	const app = new Command();

	app.addOption(new IsolatedOption('help')
		.setShort('h')
		.setDescription('Shows you this help page')
	);
	app.addPreController(req => {
		if (!req.options.help) {
			return;
		}
		logTheHelpPage(req.command, informerPool, req.options.help === 'md');
		return false;
	});

	/*
		Normal use
	*/
	app.addOption(new MultiOption('glob')
		.setShort('g')
		.setDescription('Globbing pattern(s) for finding your projects. Defaults to "*".')
		.setDefault(['*'], true)
		.setResolver(patterns => patterns.map(pattern => pattern.charAt(pattern.length - 1) === '/' ? pattern : pattern + '/'))
	);

	app.addOption(new MultiOption('filters')
		.setShort('f')
		.setDescription('Show only results that match all given filters. Use "~" to invert the filter response, and ":" for additional filter arguments.')
		.setResolver(filters => filters.map(filterSpec => {
			const isNegation = filterSpec.charAt(0) === '~';
			const [name, ...arguments] = filterSpec.substr(isNegation ? 1 : 0).split(':');
			const filter = informerPool.getFilter(name);

			if (!filter) {
				throw new Error('Filter "' + name + '" doesn\'t exist!');
			}

			return {
				...filter,
				arguments,
				isNegation
			};
		}))
	);

	app.addOption(new Option('sort')
		.setShort('s')
		.setDescription('Sort on this column. Use the negation character ("~") to inversely sort. Defaults to the first column.')
		.setResolver(sort => {
			if (typeof sort !== 'string') {
				return {
					prop: null
				};
			}
			const reverse = sort && sort.charAt(0) === '~';

			return {
				prop: informerPool.getProp(sort.substr(reverse ? 1 : 0)),
				reverse
			};
		}));

	app.addOption(new MultiOption('columns')
		.setShort('c')
		.setDescription('Additional properties to show for each directory.')
		.setDefault(['name', 'status'], true)
		.setResolver(props => props.map(propSpec => {
			const [name, ...arguments] = propSpec.split(':');
			const prop = informerPool.getProp(name);
			if (!prop) {
				throw new Error('Column "' + name + '" doesn\'t exist!');
			}
			return {
				...prop,
				arguments
			};
		}))
	);
	app.addOption(new MultiOption('run')
		.setShort('$')
		.setDescription('Run this command in every result directory')
		.isInfinite(true));

	app.setController(req => getResults(
		informerPool,
		req.options.glob,
		req.options.columns,
		req.options.sort.prop,
		req.options.sort.reverse,
		req.options.filters
	).then(data => {
			consoleLogTable(
				req.options.columns.map(prop => prop.name),
				data.map(row => row.getFormattedData())
			);

			const stats = {
				directories: data.length,
				filterNames: req.options.filters.length ?
					req.options.filters
						.map(filter => (filter.isNegation ? '~' : '') + [filter.name, ...filter.arguments].join(':'))
						.join(', ') :
					'-',
				propNames: req.options.columns.length ?
					req.options.columns.map(prop => prop.name).join(', ') :
					req.options.columns.length,
				time: (Date.now() - timeStart) + 'ms'
			};

			console.log('Directories:  ' + stats.directories);
			console.log('Filters:      ' + stats.filterNames);
			console.log('Props:        ' + stats.propNames);
			console.log('Time:         ' + stats.time);
			console.log();
			return data;
		})

		// If the --run option was set, run that in a shell for each result
		.then(results => {
			if (!req.options.run.length) {
				return;
			}
			console.log('Executing "' + req.options.run.join(' ') + '"');
			return results.reduce((deferred, result) => deferred
				.then(() => executeInDir(result.location, req.options.run))
				.then(messages => {
					console.group();
					console.log(result.location);
					console.group();
					messages.forEach(message => console[message.type === 'stdout' ? 'error' : 'log'](message.data));
					console.groupEnd();
					console.groupEnd();
				}), Promise.resolve())
		}));

	return app;
};
