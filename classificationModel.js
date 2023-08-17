const { NlpManager } = require('node-nlp');

const manager = new NlpManager({ languages: ['en'], forceNER: true });

manager.addDocument('en', "Maybe you should", 'request');
manager.addDocument('en', "It would be cool if", 'request');
manager.addDocument('en', "It would be great if", 'request');
manager.addDocument('en', "It should", 'request');
manager.addDocument('en', "Could you", 'request');
manager.addDocument('en', "Perhaps you", 'request');
manager.addDocument('en', "Maybe instead", 'request');

(async () => {
    await manager.train();
    manager.save();
})();

export default manager