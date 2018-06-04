class InformerCallback {
    constructor (name) {
        /**
         * End-user facing identifier for a prop (also called "column") or filter.
         * @type {String}
         * @required
         */
        this.name = name;

        /**
         * An explanation of what it does that's used in the help page. If your callback expects additional arguments
         * (eg. `fark --filter has-file:package.json`) you should make that obvious in the text.
         * @type {String}
         */
        this.description = null;

		/**
         * Only for InformerCallback instances used as columns/for --columns
		 * @type {'string'|'boolean'|'date'}
		 */
		this.type = null;

		/**
		 * Only for InformerCallback instances used as columns/for --columns of type "boolean"
		 * Indicates that this boolean prop can also be used as a filter
		 * @type {null}
		 */
		this.isFilterable = null;
    }

    /**
     * @param {Object} info      The accumulated exports of the retrieve() results of the parent and dependency
     *                           informers.
     * @param {String[]} args    Whatever else the user passed as input separated from the name and each other by ":"s.
     * @return {String|Boolean|null}
     */
    callback (info, ...args) {
		throw new Error('Not implemented.');
    }
}

module.exports = InformerCallback;
