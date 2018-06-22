module.exports = {
	format: date => date ? date.toDateString() : null,
	compare: (a, b) => a ? a.getTime() - b.getTime() : 1
};
