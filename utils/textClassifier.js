const { NlpManager } = require('node-nlp');
const path = require('path');
const manager = new NlpManager();

const guessLanguage = require('./languageGuesserModel.js');

const modelPath = path.resolve(__dirname, '../models/model.nlp');
manager.load(modelPath);

class textClassifier {
    /**
     * @param {Object[]} conversation An array of messages
     * @returns {Object[]} An array of objects that include the sentence it 
     * analyzed as well as its classification
     */
    static async classifyConversation(conversation) {
        const classifiedConversation = [];

        for (let message of conversation) {
            const language = guessLanguage(message).alpha3
            const analysis = await manager.process(language, message)

            classifiedConversation.push({ sentence: analysis.utterance, classification: analysis.classifications })
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
    static async classifySentences(input) {
        const splitSentences = input.split(/(?<=[.?!;])\s+/);
        const classifiedSentences = [];

        for (let sentence of splitSentences) {
            const language = guessLanguage(sentence).alpha3
            const analysis = await manager.process(language, sentence)

            classifiedSentences.push({ sentence: analysis.utterance, classification: analysis.classifications })
        }

        return classifiedSentences
    }


    /**
     * Takes in a single sentence and treats multiple sentences that is of
     * a single string as one sentence
     * @param {string} input A sentence to analyze
     * @returns {Object} An object containing the sentence it analyzed and
     * its classification
     */
    static async classifySentence(input) {
        const language = guessLanguage(input).alpha3
        const analysis = await manager.process(language, input)

        return analysis
        return { sentence: analysis.utterance, classification: analysis.classifications }
    }

    static async #getClassificationTriggerWords() {

    }
}

module.exports = textClassifier;