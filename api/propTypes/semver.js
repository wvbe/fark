const semver = require('semver');

module.exports = {
	format: str => str || null,
	compare: (a, b) => {
		if (semver.valid(a) && semver.valid(b)) {
			return semver.compare(a, b);
		}
		if (semver.valid(a) && !semver.valid(b)) {
			return 1;
		}

		if (!semver.valid(a) && semver.valid(b)) {
			return -1;
		}

		return (a || '').localeCompare(b || '');
	}
};
