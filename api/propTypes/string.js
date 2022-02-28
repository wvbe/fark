module.exports = {
	format: str => str || null,
	compare: (a, b) => (typeof a === 'string' ? a.localeCompare(b) : 1)
};
