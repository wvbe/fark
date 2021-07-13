const glob = require('multi-glob').glob;
const Gauge = require('gauge');

const defaultPropType = {
	format: str => str || null,
	compare: (a, b) => (typeof a === 'string' ? a.localeCompare(b) : 1)
};

class Row {
	constructor(location, columns, data) {
		this.location = location;
		this.columns = columns;
		this.informerData = data;
	}

	getDataForColumn(column) {
		const index = this.columns.findIndex(c => c.name === column.name);

		return this.getCellData()[index];
	}

	getCellData() {
		if (!Array.isArray(this.cellData)) {
			this.cellData = this.columns.map(prop =>
				prop.callback(this.informerData, ...prop.args)
			);
		}

		return this.cellData;
	}

	getFormattedData() {
		if (!Array.isArray(this.formattedData)) {
			this.formattedData = this.columns.map((prop, i) => {
				return (prop.type || defaultPropType).format(this.getCellData()[i]);
			});
		}

		return this.formattedData;
	}
}

module.exports = function getRowData(
	informerPool,
	globbingPattern,
	columns,
	sortColumn,
	sortInverse,
	filters
) {
	var gauge = new Gauge();
	gauge.show('Finding projects');

	let finished = 0;
	return (
		new Promise((res, rej) =>
			glob(globbingPattern, (err, data) => (err ? rej(err) : res(data)))
		)
			// Get expensive info as cheaply as possible from the informer pool
			.then(directories =>
				informerPool.retrieveForOptions(
					directories,
					columns.map(c => c.name),
					filters.map(f => f.name),
					(informers, directories) => {
						const progress = ++finished / (informers.length * directories.length);
						gauge.show(
							`Retrieving information (${finished}/${
								informers.length * directories.length
							})`,
							progress
						);
						gauge.pulse();
					}
				)
			)

			// Filter irrelevant results based on the --filter option
			.then(informerDatas => {
				gauge.hide();

				return informerDatas
					.filter(informerData =>
						filters.every(
							filter =>
								filter.isNegation === !filter.callback(informerData, ...filter.args)
						)
					)
					.map(data => new Row(data.path, columns, data));
			})

			.then(rows =>
				sortColumn
					? rows.sort(
							(a, b) =>
								(sortColumn.type || defaultPropType).compare(
									a.getDataForColumn(sortColumn),
									b.getDataForColumn(sortColumn)
								) * (sortInverse ? -1 : 1)
					  )
					: rows
			)
	);
};
