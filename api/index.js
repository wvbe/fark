/**
 * See ../bin/fark for a working example of how to use this thing.
 *
 * @type {(function(informers: Informer[]): Command)}
 */
module.exports = require('../src/createFarkCommand');

/**
 * You don't have to use this, but here you go; a formal definition of how you can define your own Informer.
 *
 * @type {{Informer: Informer, InformerCallback: InformerCallback}}
 */
module.exports.interfaces = {
	Informer: require('./interfaces/Informer'),
	InformerCallback: require('./interfaces/InformerCallback')
};

/**
 * You don't have to use this, but here's a list of informers that I thought were a good idea.
 *
 * Informers asynchronously resolve information in their own way (child process or whatever), and use that information
 * to provide columns and/or filters that user can use. Informers also expose their data to other informers if those
 * depend on it. Usually, one informer would run one child process, parse STDOUT and STDERR into a useful summary and
 * expose (part) of that as new --columns and --filters options.
 *
 * @type {Informer[]}
 */
module.exports.defaultInformers = [
	require('./defaultInformers/fstatInformer'),
	require('./defaultInformers/systemInformer'),
	require('./defaultInformers/npmInformer'),
	require('./defaultInformers/gitStatusInformer'),
	require('./defaultInformers/gitRemoteStatusInformer'),
	require('./defaultInformers/gitRemoteHostInformer'),
	require('./defaultInformers/gitBranchInformer')
];


/**
 * You don't have to use this, but here's a list of property types that deserved some extra love.
 *
 * Prop type definitions prepare informer data for sorting and formatting. For example, a string is sorted differently
 * from a number, and a date would be formatted nicely.
 *
 * @type {*[]}
 */
module.exports.propTypes = {
	date: require('./propTypes/date'),
	string: require('./propTypes/string'),
	boolean: require('./propTypes/boolean'),
	semver: require('./propTypes/semver')
};
