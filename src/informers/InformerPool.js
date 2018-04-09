

class InformerPool {
	constructor (initial) {
		this.informers = {};

		if (Array.isArray(initial)) {
			initial.forEach(informer => this.registerInformer(informer));
		}
	}

	registerInformer (importedObject) {
		this.informers[importedObject.name] = importedObject;
	}

	getInformer (name) {
		return this.informers[name]
	}

	getProp (name) {
		return Object.keys(this.informers)
			.reduce((props, informerName) => props.concat(this.informers[informerName].props), [])
			.find(prop => prop.name === name);
	}

	getFilter (name) {
		return Object.keys(this.informers)
			.reduce((props, informerName) => props.concat(this.informers[informerName].filters), [])
			.find(filter => filter.name === name);
	}

	toArray () {
		return Object.keys(this.informers).map(name => this.informers[name]);
	}
	resolveDependencies (myWishList) {
		const wishList = myWishList.slice();

		let newWishListItems = wishList.length;
		let i = 0;
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

	runDependencyTree (resolvedDependencies, callback) {
		const results = {};
		const pending = [];
		const queuedDependencies = resolvedDependencies.slice();

		return new Promise(function iterate (resolve) {
			const readyDeps = queuedDependencies
				// Find informers that have zero (unmet) dependencies
				.filter(informer => informer.dependencies.filter(dep => !results[dep]).length === 0);

			// If there are no new tasks and nothing is pending, resolve
			if (!readyDeps.length && !pending.length) {
				return resolve(Object.keys(results).reduce((accum, depName) => Object.assign(accum, results[depName]), {}));
			}

			readyDeps.forEach(informer => {
				// Remove from queue
				queuedDependencies.splice(queuedDependencies.indexOf(informer), 1);

				// Register as pending
				pending.push(informer);

				// Start async
				Promise.resolve(callback(
						informer,
						informer.dependencies.reduce((accum, depName) => Object.assign(accum, results[depName]), {})
					))
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
		})
	}
}

module.exports = InformerPool;
