const timeStart = Date.now();
var stringSimilarity = require('string-similarity');
const glob = require('multi-glob').glob;
const { Command, Option, MultiOption, IsolatedOption } = require('ask-nicely');
const InformerPool = require('./informers/InformerPool');
const executeInDir = require('./primitives/executeInDir');
const getResults = require('./primitives/getResults');
const logTheHelpPage = require('./shenanigans/logTheHelpPage');
const logTable = require('./shenanigans/logTable');

module.exports = (informers = []) => {
	const informerPool = new InformerPool(informers);

	const app = new Command();

	function formatErrorMessageOfTypeNotFound (typeLabel, query, options) {
		const possibleMatches = stringSimilarity
			.findBestMatch(query, options)
			.ratings
			.filter(result => result.rating > 0)
			.sort((a, b) => b.rating - a.rating);

		return `${typeLabel} "${query}" does not exist.` + (possibleMatches.length ?
			' Did you mean:\n\n' + possibleMatches.map(m => '  - ' + m.target).join('\n') :
			'');
	}

	app.addMiddleware = (optionName, short, description, preController) => {
		app.addOption(new IsolatedOption(optionName)
			.setShort(short)
			.setDescription(description));
		app.addPreController(req => req.options[optionName] ?
			Promise.resolve(preController(req)).then(() => false) :
			null);
	};


	app.addMiddleware('help', 'h', 'Shows you this help page', req => {
		logTheHelpPage(req.command, informerPool, req.options.help === 'md');
	});

	app.addMiddleware('version', 'v', 'Gives the fark version', req => {
		console.log(require('../package.json').version);
	});

	/*
		Normal use
	*/
	app.addOption(new MultiOption('glob')
		.setShort('g')
		.setDescription('Globbing pattern(s) for finding your projects. Defaults to "*".')
		.setDefault(['*'], true)
		.setResolver(patterns => patterns.map(pattern => pattern.charAt(pattern.length - 1) === '/' ?
			pattern :
			pattern + '/')));

	app.addOption(new MultiOption('filters')
		.setShort('f')
		.setDescription('Show only results that match all given Filters. Use "~" to invert the filter response, and ":" for additional filter arguments.')
		.setResolver(filters => filters.map(filterSpec => {
			const isNegation = filterSpec.charAt(0) === '~';
			const [name, ...arguments] = filterSpec.substr(isNegation ? 1 : 0).split(':');
			const filter = informerPool.getFilter(name);
			if (!filter) {
				throw new Error(formatErrorMessageOfTypeNotFound('Filter', name, informerPool.getFilters().map(f => f.name)));
			}

			return {
				...filter,
				arguments,
				isNegation
			};
		})));

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
			const name = sort.substr(reverse ? 1 : 0);
			const prop = informerPool.getProp(name);
			if (!prop) {
				throw new Error(formatErrorMessageOfTypeNotFound('Sorting column', name, informerPool.getProps().map(f => f.name)));
			}

			return {
				prop,
				reverse
			};
		}));

	app.addOption(new Option('nowrap')
		.setShort('W')
		.setDescription('Do not stretch or shrink the results table to terminal width'));

	app.addOption(new MultiOption('columns')
		.setShort('c')
		.setDescription('Additional properties to show for each directory, see also the available Columns.')
		.setDefault(['name', 'status'], true)
		.setResolver(props => props.map(propSpec => {
			const [name, ...arguments] = propSpec.split(':');
			const prop = informerPool.getProp(name);
			if (!prop) {
				throw new Error(formatErrorMessageOfTypeNotFound('Column', name, informerPool.getProps().map(f => f.name)));
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
			req.options.filters)
		.then(data => {
			logTable(
				req.options.columns.map(prop => prop.name),
				data.map(row => row.getFormattedData()),
				!!req.options.nowrap
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
					messages.forEach(message => console[message.type === 'stderr' ? 'error' : 'log'](message.data));
					console.groupEnd();
					console.groupEnd();
				}), Promise.resolve())
		}));

	return app;
};
