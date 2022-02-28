// Asynchronously resolves as many informers in parallel as the dependency tree allows
function asyncMapInformersInDependencyOrder(informers, callback) {
	// The accumulated results stored by informer name
	const results = {};

	// The informers that are currently doing an async retrieve()
	const pending = [];

	// Informers that are not yet pending or resolved
	const queuedDependencies = informers.slice();

	return new Promise(function iterate(resolve) {
		const readyDeps = queuedDependencies
			// Find informers that have zero (unmet) dependencies so we can resolve them
			.filter(informer => informer.dependencies.filter(dep => !results[dep]).length === 0);

		// If there are no new tasks and nothing is pending, resolve with all informer data
		if (!readyDeps.length && !pending.length) {
			const mergedResults = Object.keys(results).reduce(
				(merged, depName) => Object.assign(merged, results[depName]),
				{}
			);
			return resolve(mergedResults);
		}

		readyDeps.forEach(informer => {
			// Remove from queue
			queuedDependencies.splice(queuedDependencies.indexOf(informer), 1);

			// Register as pending
			pending.push(informer);

			// Start async
			Promise.resolve(
				callback(
					informer,
					informer.dependencies.reduce(
						(accum, depName) => Object.assign(accum, results[depName]),
						{}
					)
				)
			)
				.then(props => {
					// Unregister as pending
					pending.splice(pending.indexOf(informer), 1);

					// Write results
					results[informer.name] = props;

					// Repeat
					iterate(resolve);
				})
				.catch(err => {
					console.error(err.stack);
				});
		});
	});
}

class InformerPool {
	constructor(initial) {
		// Informers by name
		this.informers = {};

		if (Array.isArray(initial)) {
			initial.forEach(informer => this.registerInformer(informer));
		}
	}

	registerInformer(importedObject) {
		this.informers[importedObject.name] = importedObject;
	}

	getInformer(name) {
		return this.informers[name];
	}

	// A flat list of all informers
	getInformers() {
		return Object.keys(this.informers).map(name => this.informers[name]);
	}

	// The subset of informers that provide any number of the named props and filters, and the total of dependency
	// informers.
	getInformersForOptions(propNames, filterNames) {
		const optionProviders = this.getInformers().filter(
			informer =>
				(informer.props || []).some(p => propNames.includes(p.name)) ||
				(informer.filters || []).some(p => filterNames.includes(p.name)) ||
				(informer.props || [])
					.filter(p => p.isFilterable)
					.some(p => filterNames.includes(p.name))
		);

		return this.getDependenciesForInformers(optionProviders);
	}

	retrieveForOptions(directories, propNames, filterNames, forEachCallback) {
		const informers = this.getInformersForOptions(propNames, filterNames);

		return Promise.all(
			directories.map(directory =>
				asyncMapInformersInDependencyOrder(informers, (informer, info) => {
					forEachCallback(informers, directories, informer, directory);
					return informer.retrieve(info, directory);
				})
			)
		);
	}

	// All available props
	getProps() {
		return this.getInformers().reduce((props, informer) => {
			return props.concat(informer.props || []);
		}, []);
	}

	getProp(name) {
		return this.getProps().find(prop => prop.name === name);
	}

	// All available filters
	getFilters() {
		return this.getInformers().reduce((props, informer) => {
			return props
				.concat(informer.filters || [])
				.concat((informer.props || []).filter(prop => prop.isFilterable));
		}, []);
	}

	getFilter(name) {
		return this.getFilters().find(filter => filter.name === name);
	}

	getDependenciesForInformers(informers) {
		const wishList = informers.slice();

		let newWishListItems = wishList.length;
		while (newWishListItems) {
			const discoveredDepencies = wishList
				// Gather all listed dependencies
				.reduce((depNames, item) => depNames.concat(item.dependencies), [])
				// Filter out duplicate names early
				.filter((depName, i, deps) => deps.indexOf(depName) === i)
				// Filter out dependencies already in the wishlist
				.filter(depName => !wishList.some(item => item.name === depName))
				// Map names to their objects
				.map(depName => this.getInformer(depName));

			// Update the while() condition
			newWishListItems = discoveredDepencies.length;

			// Prepend discoveries to the wishlist
			wishList.splice(0, 0, ...discoveredDepencies);
		}

		return wishList;
	}
}

module.exports = InformerPool;
