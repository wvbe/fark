module.exports = function throttlePromises(promiseCreators, maxPromises, onEach = () => {}) {
	const queue = promiseCreators.slice();
	const busy = [];
	const finished = new Array(promiseCreators.length);

	function iterate(createPromise, resolveAll) {
		const index = promiseCreators.indexOf(createPromise);
		busy.push(createPromise);
		createPromise()
			.then(resolved => {
				finished[index] = { resolved };
				onEach(resolved, undefined, index);
			})
			.catch(rejected => {
				finished[index] = { rejected };
				onEach(undefined, rejected, index);
			})
			.then(() => {
				busy.splice(busy.indexOf(createPromise), 1);

				if (!queue.length && !busy.length) {
					resolveAll(finished);
				} else if (queue.length) {
					iterate(queue.shift(), resolveAll);
				}
			});
	}

	return new Promise(resolve => {
		if (!queue.length) {
			return resolve(finished);
		}
		for (let i = 0; i <= maxPromises && queue.length; i++) {
			iterate(queue.shift(), resolve);
		}
	});
};
