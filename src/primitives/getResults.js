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
		// Get expensive info as cheaply as possible from the informer pool
		.then(directories => informerPool.retrieveForOptions(
			directories,
			columns.map(c => c.name),
			filters.map(f => f.name)
		))

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
				// Map to a 2d array for rows and cells
				.map(row => columns.map(prop => prop.callback(row, ...prop.arguments)))
				// Sort by (the inverted of) whatever the data type comparator wants
				.sort((a, b) => sortInverse ?
					dataTypes[sortIndex].compare(b[sortIndex], a[sortIndex]) :
					dataTypes[sortIndex].compare(a[sortIndex], b[sortIndex]))
				// Format according to data type
				.map(row => row.map((cell, i) => dataTypes[i].format(cell)));
		});
};
