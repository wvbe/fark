'use strict';

const FILTER_SPLIT_CHAR = ':';
const NEGATION_CHARACTER = '~';

module.exports = function (directories, filters, filterStrings) {
	return ['is-git-controlled']
		.concat(filterStrings)
		.reduce((deferred, filterString, i, all) => deferred.then(directories => {
			const isNegation = filterString.charAt(0) === NEGATION_CHARACTER;

			const [filterName, ...filterOptions] = filterString.substr(isNegation ? 1 : 0).split(FILTER_SPLIT_CHAR),
				filter = filters.find(filter => filter.name === filterName);

			if (!filter)
				throw new Error(`Filter "${filterName}" does not exist`);

			const results = [];

			return Promise.all(directories.map(directory => {
					return filter.callback(directory, ...filterOptions)
						.then(isMatchForFilter => !!isMatchForFilter === !isNegation && results.push(directory))
						.catch(err => results.push(err));
				}), 10)
				.then(() => {
					// Output from Promise.all is ignored
					return results;
				});
			}), Promise.resolve(directories));
};
