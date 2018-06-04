const glob = require('multi-glob').glob;

const DATA_TYPES = {
	string: {
		format: str => str || null,
		compare: (a, b) => typeof a === 'string' ? a.localeCompare(b) : 1
	},
	boolean: {
		format: bool => bool ? 'yes' : 'no',
		compare: (a, b) => a === b ? 0 : (a ? -1 : 1)
	},
	date: {
		format: date => date ? date.toDateString() : null,
		compare: (a, b) => a ? a.getTime() - b.getTime() : 1
	}
};

module.exports = function getResults (
	informerPool,
	globbingPattern,
	columns,
	sortColumn,
	sortInverse,
	filters
) {
	return new Promise((res, rej) => glob(globbingPattern, (err, data) => err ? rej(err) : res(data)))
		.then(directories => {
			const requiredInformers = informerPool
				.toArray()
				.filter(informer => columns.some(prop => informer.props.some(p => p.name === prop.name)) ||
					filters.some(filter => informer.filters.some(f => f.name === filter.name)));
			const allInformers = informerPool.resolveDependencies(requiredInformers);

			return Promise.all(directories.map(directory => informerPool.runDependencyTree(allInformers, (informer, info) => {
				return informer.retrieve(info, directory);
			})));
		})

		// Filter irrelevant results based on the --filter option
		.then(informerDatas => informerDatas.filter(informerData => filters.every(
			filter => filter.isNegation === !filter.callback(informerData, ...filter.arguments)
		)))

		.then(informerDatas => {
			const dataTypes = columns.map(prop => DATA_TYPES[prop.type || 'string']);

			// Prepare some info for sorting results
			const sortIndex = sortColumn ?
				Math.max(columns.findIndex(p => p.name === sortColumn.name), 0) :
				0;

			return informerDatas
			// Map to a 2d array
				.map(row => columns.map(prop => prop.callback(row, ...prop.arguments)))
				// Sort by their raw values
				.sort((a, b) => sortInverse ?
					dataTypes[sortIndex].compare(b[sortIndex], a[sortIndex]) :
					dataTypes[sortIndex].compare(a[sortIndex], b[sortIndex]))
				// Format values according to their data type
				.map(row => row.map((cell, i) => dataTypes[i].format(cell)));
		});
};
