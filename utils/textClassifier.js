const { NlpManager } = require('node-nlp');
const manager = new NlpManager();

manager.load('../models/englishTextClassificationModel.js');

class textClassifier {
    /**
     * @param {Object[]} conversation An array of messages
     * @returns {Object[]} An array of objects that include the sentence it 
     * analyzed as well as its classification
     */
    static async classifyConversation(language, conversation) {
        const classifiedConversation = [];

        for (let message of conversation) {
            const analysis = await manager.process(language, message)
            classifiedConversation.push({ sentence: analysis.utterance, classification: analysis.classification })
        }

        return classifiedConversation
    }
    /**
     * Separates a string that includes several sentences and analyzes
     * each sentence separately.
     * @param {string} input A string containing more than one sentence
     * @returns {Object[]} An array of objects that include the sentence it 
     * analyzed as well as its classification
     */
    static async classifySentences(language, input) {
        const splitSentences = input.split(/(?<=[.?!;])\s+/);
        const classifiedSentences = [];

        for (let sentence of splitSentences) {
            const analysis = await manager.process(language, sentence)
            classifiedSentences.push({ sentence: analysis.utterance, classification: analysis.classifications })
        }

        return classifiedSentences
    }
    /**
     * @param {string} input A sentence to analyze
     * @returns {Object} An object containing the sentence it analyzed and
     * its classification
     */
    static async classifySentence(language, input) {
        const analysis = await manager.process(language, input)

        return { sentence: analysis.utterance, classification: analysis.classification }
    }
}

module.exports = textClassifier;