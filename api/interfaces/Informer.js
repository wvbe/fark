class Informer {
	constructor (name) {
		/**
		 * Used as an identifier for informer dependencies. Not end-user facing.
		 * @type {String}
		 * @required
		 */
		this.name = name;

		/**
		 * Depending on another informer gives you whatever they export before you retrieve.
		 * @type {Informer#name[]}
		 */
		this.dependencies = [];

		/**
		 * @type {InformerCallback[]}
		 */
		this.props = [];

		/**
		 * @type {InformerCallback[]}
		 */
		this.filters = [];
	}

	/**
	 * @param {Object} info  An object with the exports accumulated from informers you depend on.
	 * @param {String} location The full path to the directory you are informing on.
	 * @return {null|Object}       An object with exports to use in your props and filters, but also other informers
	 *               that depend on you.
	 */
	retrieve (info, location) {

	}
}

module.exports = Informer;