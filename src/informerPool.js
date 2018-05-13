const InformerPool = require('./informers/InformerPool');
const informerPool = new InformerPool([
    require('./informers/fstatInformer'),
    require('./informers/systemInformer'),
    require('./informers/npmInformer'),
    require('./informers/gitStatusInformer')
]);

module.exports = informerPool;