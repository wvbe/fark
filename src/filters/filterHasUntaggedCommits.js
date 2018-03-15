const spawnProcess = require('../primitives/executeInDir');

module.exports = {
	name: 'untagged',
	description: 'Only results that have untagged commits',
	callback: (targetPath) => spawnProcess(targetPath, ['git', 'describe', '--tags'])
		.then((messages) => {
			messages = messages.map((message) => message.data.toString().split('\n'))
				.reduce((flattenedMessages, messageLines) => flattenedMessages.concat(messageLines), [])
				.filter((message) => message.length > 0);
			return messages.pop().indexOf('-') !== -1;
		})
};
