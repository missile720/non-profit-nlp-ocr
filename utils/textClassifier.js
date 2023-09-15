const { NlpManager, Tokenizer } = require('node-nlp');
const keyword_extractor = require('keyword-extractor');
const path = require('path');
const guessLanguage = require('./languageGuesserModel.js');

const manager = new NlpManager();
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
            const separatedSentences = await this.classifySentences(message);
            classifiedConversation.push(separatedSentences);
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
    static async classifySentences(sentences) {
        const splitSentences = sentences.split(/(?<=[.?!;])\s+/);
        const classifiedSentences = [];

        for (let sentence of splitSentences) {
            const classifiedSentence = await this.classifySentence(sentence)
            classifiedSentences.push(classifiedSentence)
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
        const language = guessLanguage(input)
        const analysis = await manager.process(language.alpha3, input)
        const analysisEntities = await keyword_extractor.extract(input, {
            language: language.alpha2,
            remove_digits: false,
            return_changed_case: true,
            return_chained_words: true,
            remove_duplicates: false
        })

        return { sentence: analysis.utterance, classification: analysis.classifications[0], keyWords: analysisEntities }
    }
}

module.exports = textClassifier;