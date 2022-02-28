const { table } = require('table');

module.exports = function consoleLogTable(columns, data, noScaling) {
	// Add the column names to the top and bottom of the table
	data.splice(0, 0, columns);
	data.push(columns);

	const maxColumnData = data.reduce(
		(accum, row) => row.map((cell, n) => Math.max(accum[n], (cell || '').length)),
		columns.map(() => 0)
	);
	const totalWidth = maxColumnData.reduce((total, columnWidth) => total + columnWidth, 0);
	const availableSpace =
		!noScaling && process.stdout && process.stdout.columns
			? process.stdout.columns - (maxColumnData.length + 1) * 3
			: null;

	console.log(
		table(data, {
			drawHorizontalLine: (index, last) =>
				index === 0 || index === 1 || index === last || index === last - 1,
			columns: columns.map((column, i) =>
				Object.assign(
					{
						alignment: 'left',
						wrapWord: true
					},
					availableSpace
						? {
								width: Math.floor(
									availableSpace *
										(0.25 / columns.length +
											(0.75 * maxColumnData[i]) / totalWidth)
								)
						  }
						: null
				)
			)
		})
	);
};
