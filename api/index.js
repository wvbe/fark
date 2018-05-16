/**
 * See ../bin/fark for a working example of how to use this thing.
 * @type {(function(informers: Informer[]): Command)}
 */
module.exports = require('../src/createFarkCommand');

/**
 * You don't have to use this, but here you go; a formal definition of how you can define your own Informer.
 * @type {{Informer: Informer, InformerCallback: InformerCallback}}
 */
module.exports.interfaces = {
    Informer: require('./interfaces/Informer'),
    InformerCallback: require('./interfaces/InformerCallback')
};

/**
 * You don't have to use this, but here's a list of informers that I thought were a good idea.
 * @type {*[]}
 */
module.exports.defaultInformers = [
    require('./defaultInformers/fstatInformer'),
    require('./defaultInformers/systemInformer'),
    require('./defaultInformers/npmInformer'),
    require('./defaultInformers/gitStatusInformer')
];