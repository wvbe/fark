const url = require('url');
const gitRemoteOriginUrl = require('git-remote-origin-url');

module.exports = {
	name: 'origin-url',
	description: 'Only results who have their origin set to a given host',
	callback:(targetPath, hostname) => gitRemoteOriginUrl(targetPath)
		.then(remoteUrl => url.parse(remoteUrl.includes('://') ? remoteUrl : 'protocol://' + remoteUrl))
		.then(remoteUrl => remoteUrl.hostname === hostname)
};