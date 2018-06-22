// const color = {
// 	green: '\x1b[32m',
// 	red: '\x1b[31m',
// 	reset: '\x1b[0m'
// };

// const formatWithColor = bool => bool ?
// 	color.green + '✓' + color.reset :
// 	color.red + '☓' + color.reset;

const formatWithoutColor = bool => bool ? '✓' : '';

module.exports = {
	format: formatWithoutColor,
	compare: (a, b) => a === b ? 0 : (a ? -1 : 1)
};
