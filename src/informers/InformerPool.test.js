const InformerPool = require('./InformerPool');
const informers = new InformerPool([
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

describe('informerManager', () => {
	it('getInformer', () => {
		// Something that exists
		expect(informers.getInformer('path')).toBeTruthy();

		// Something that does not exist
		expect(informers.getInformer('xxx')).toBeUndefined();
	});

	it('resolveDependencies', () => {
		// Load something without a dependency
		expect(informers.resolveDependencies([informers.getInformer('path')])).toHaveLength(1);

		// Load something with a dependency
		expect(informers.resolveDependencies([informers.getInformer('test-1')])).toHaveLength(2);

		// Attempt load something with a broken dependency
		expect(() => informers.resolveDependencies([informers.getInformer('test-2')])).toThrow();
	});

	it('runDependencyTree', () => {
		expect.assertions(3);

		// Raise whatever is necessary to get the "test-1" informer to work
		return informers.runDependencyTree(
				informers.resolveDependencies([informers.getInformer('test-1')]),
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
        expect(informers.getProp('my-prop')).toBeTruthy();
        expect(informers.getProp('derp')).toBeUndefined();
    });

    it('getFilter', () => {
        expect(informers.getFilter('my-filter')).toBeTruthy();
        expect(informers.getFilter('derp')).toBeUndefined();
    });
});