const InformerPool = require('./InformerPool');
const informerPool = new InformerPool([
	{ name: 'path',    dependencies: [],       retrieve: () => ({ a: 'bzt' }) },
	{ name: 'test-1',  dependencies: ['path'], retrieve: (props) => ({ b: 'arf', received: props }) },
	{ name: 'test-1b', dependencies: ['path'], retrieve: () => ({ c: true }) },
	{
		name: 'test-2',
		dependencies: ['derp'],
		retrieve: () => true,
		props: [
			{ name: 'my-prop' }
		],
		filters: [
			{ name: 'my-filter' }
		]
	}
]);

describe('InformerPool', () => {
	it('getInformer', () => {
		// Something that exists
		expect(informerPool.getInformer('path')).toBeTruthy();

		// Something that does not exist
		expect(informerPool.getInformer('xxx')).toBeUndefined();
	});

	it('getDependenciesForInformers', () => {
		// Load something without a dependency
		expect(informerPool.getDependenciesForInformers([informerPool.getInformer('path')])).toHaveLength(1);

		// Load something with a dependency
		expect(informerPool.getDependenciesForInformers([informerPool.getInformer('test-1')])).toHaveLength(2);

		// Attempt load something with a broken dependency
		expect(() => informerPool.getDependenciesForInformers([informerPool.getInformer('test-2')])).toThrow();
	});

	it('runDependencyTree', () => {
		expect.assertions(3);

		// Raise whatever is necessary to get the "test-1" informer to work
		return informerPool.runDependencyTree(
				informerPool.getDependenciesForInformers([informerPool.getInformer('test-1')]),
				(informer, props) => informer.retrieve(props)
			)
			.then(results => {
				// Test a value provided by a dependency informer
				expect(results.a).toBe('bzt');

				// Test the value from test-1 informer itself
				expect(results.b).toBe('arf');

				// Test a value that should not be provided
				expect(results.c).toBeUndefined();
			});
	});

	it('getProp', () => {
		expect(informerPool.getProp('my-prop')).toBeTruthy();
		expect(informerPool.getProp('derp')).toBeUndefined();
	});

	it('getFilter', () => {
		expect(informerPool.getFilter('my-filter')).toBeTruthy();
		expect(informerPool.getFilter('derp')).toBeUndefined();
	});

	it('getFilters', () => {
		expect(informerPool.getFilters().map(f => f.name))
			.toEqual(expect.arrayContaining(['my-filter']));
	});
});
