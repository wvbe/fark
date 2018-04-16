const timeStart = Date.now();

const glob = require('glob');
const util = require('util');
const { table } = require('table');
const { Command, Option, MultiOption, IsolatedOption } = require('ask-nicely');

const executeInDir = require('./primitives/executeInDir');
const helpController = require('./primitives/helpController');
const InformerPool = require('./informers/InformerPool');

const informerPool = new InformerPool([
	require('./informers/fstatInformer'),
	require('./informers/systemInformer'),
	require('./informers/npmInformer'),
	require('./informers/gitStatusInformer')
]);

function consoleLogTable (columns, data) {
    // Add the column names to the top and bottom of the table
    data.splice(0, 0, columns);
    data.push(columns);

    console.group();
    console.log(table(data, Object.assign({}, defaultTableOptions, {
        columns: columns.map(() => ({
            alignment: 'left',wrapWord: true
        }))
    })));
    console.groupEnd();
}

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

	console.log('Options');
    consoleLogTable(['short', 'long', 'description', 'required'], concatAllOfAncestors(command, 'options')
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(option => [
                option.short ? '-' + option.short : '',
                '--' + option.name,
            option.description ? option.description : NO_DESCRIPTION,
                option.required ? 'yes' : 'no'
            ]));

    console.log(`Columns`);
    consoleLogTable(['name', 'description'], informerPool
        .toArray()
        .reduce((propNames, informer) => propNames.concat(informer.props), [])
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(prop => [
            prop.name,
            prop.description ? prop.description.match(/.{1,2}/g).join('#') : NO_DESCRIPTION
        ]));


    console.log(`Filters`);
	consoleLogTable(['name', 'description'], informerPool
        .toArray()
        .reduce((propNames, informer) => propNames.concat(informer.filters), [])
		.sort((a, b) => a.name.localeCompare(b.name))
        .map(filter => [
            filter.name,
            filter.description ? filter.description.match(/.{1,2}/g).join('#') : NO_DESCRIPTION
        ]));


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
		const sortIndex = Math.max(req.options.columns.indexOf(req.options.sort.prop), 0);

		const data = results
			// Map to a 2d array
			.map(result => req.options.columns.map(prop => prop.callback(result)))
			.sort((a, b) => (req.options.sort.reverse ? b : a)[sortIndex].localeCompare((req.options.sort.reverse ? a : b)[sortIndex]));

		consoleLogTable(req.options.columns.map(prop => prop.name), data);

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
			time: (Date.now() - timeStart) + 'ms'
		};
		console.log('  Directories:  ' + stats.directories);
		console.log('  Filters:      ' + stats.filterNames);
		console.log('  Props:        ' + stats.propNames);
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
