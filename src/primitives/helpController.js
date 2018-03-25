'use strict';

const NO_NAME = '<no name>',
	NO_DESCRIPTION = '<no description>',
	NONE = '<none>';

function concatAllOfAncestors (command, propertyName) {
	return (command.parent
		? concatAllOfAncestors(command.parent, propertyName)
		: []).concat(command[propertyName]);
}

module.exports = function helpController(req) {
	let command = req.command;

	console.log(``);
	console.log(`Name:            ${command.name || NO_NAME}`);
	console.log(`Description:     ${command.description || NO_DESCRIPTION}`);

	console.log(`Child commands:  ${command.children.length || NONE}`);
	command.children
		.sort((a, b) => a.name < b.name ? -1 : 1)
		.forEach(cmd =>{
			console.log(`    ${cmd.name}    ${cmd.description || NO_DESCRIPTION}`);
		});

	let parameters = concatAllOfAncestors(command, 'parameters');
	console.log(`Parameters:      ${parameters.length || NONE}`);
	parameters
		.forEach(param => {
			console.log(`    {${param.name}}    ${param.description || NO_DESCRIPTION}`);
		});

	let options = concatAllOfAncestors(command, 'options');
	console.log(`Options:         ${options.length || NONE}`);
	options
		.sort((a, b) => a.name < b.name ? -1 : 1)
		.forEach(option => {
			console.log([
				'',
				option.short ? '-' + option.short : '  ',
				'--' + option.name,
				option.required ? '* ' : '' + (option.description || NO_DESCRIPTION)
			].join('    '));
		});

	console.log(``);

	return false;
};
