const { table } = require('table');
const fs = require('fs');
const path = require('path');
const informerPool = require('../informerPool');
const NO_DESCRIPTION = '';

const TABLE_DEFAULT_OPTIONS = {
    drawHorizontalLine: (index, last) => index === 0 || index === 1 || index === last || index === last - 1
};
const TABLE_MD_OPTIONS = {
    drawHorizontalLine: (index, last) => index === 1,
    border: {
        topBody:  `-`,
        topJoin:  `|`,
        topLeft:  `|`,
        topRight: `|`,

        bottomBody:  `-`,
        bottomJoin:  `|`,
        bottomLeft:  `|`,
        bottomRight: `|`,

        bodyLeft:  `|`,
        bodyRight: `|`,
        bodyJoin:  `|`,

        joinBody:  `-`,
        joinLeft:  `|`,
        joinRight: `|`,
        joinJoin:  `|`
    }
};
function consoleLogTable (markdown, name, columns, data) {
    if (markdown) {
        console.log('## ' + name);
        console.log();
    }
    else {
        console.log(name);
    }

    console.log(table([
        columns,
        ...data
    ], markdown ? TABLE_MD_OPTIONS : TABLE_DEFAULT_OPTIONS))
}
function concatAllOfAncestors (command, propertyName) {
    return (command.parent
        ? concatAllOfAncestors(command.parent, propertyName)
        : []).concat(command[propertyName]);
}

const MD_SEP_STR = '<!-- Start of autogenerated README -->';
module.exports = function (command, fromMarkdown) {

    if (fromMarkdown) {
        const markdownContent = fs.readFileSync(path.join(__dirname, '..', '..', 'README.md'), 'utf-8').split(MD_SEP_STR)[0];
        console.log(markdownContent + MD_SEP_STR);
        console.log();
    }

    if (!fromMarkdown) {
        console.group();
    }
    consoleLogTable(fromMarkdown, 'Options', ['short', 'long', 'description', 'required'], concatAllOfAncestors(command, 'options')
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(option => [
            option.short ? '-' + option.short : '',
            '--' + option.name,
            option.description ? option.description : NO_DESCRIPTION,
            option.required ? 'yes' : 'no'
        ]));

    consoleLogTable(fromMarkdown, 'Columns', ['name', 'description'], informerPool
        .toArray()
        .reduce((propNames, informer) => propNames.concat(informer.props), [])
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(prop => [
            prop.name,
            prop.description ? prop.description : NO_DESCRIPTION
        ]));

    //filter.description.match(/.{1,2}/g).join('#')
    consoleLogTable(fromMarkdown, 'Filters', ['name', 'description'], informerPool
        .toArray()
        .reduce((propNames, informer) => propNames.concat(informer.filters), [])
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(filter => [
            filter.name,
            filter.description ? filter.description : NO_DESCRIPTION
        ]));

    if (!fromMarkdown) {
        console.groupEnd();
    }
};