const { split } = require('@tensorflow/tfjs');
const { NlpManager } = require('node-nlp');

const manager = new NlpManager({ languages: ['en'], forceNER: true });

manager.addDocument('en', "Could you make this change?", 'request');
manager.addDocument('en', "I suggest we update this part.", 'request');
manager.addDocument('en', "It would be cool if you could add", 'request');
manager.addDocument('en', "It would be great if this could be improved:", 'request');
manager.addDocument('en', "Could you consider changing", 'request');
manager.addDocument('en', "Perhaps you could enhance", 'request');
manager.addDocument('en', "Is it possible to modify", 'request');
manager.addDocument('en', "Can you add functionality for", 'request');
manager.addDocument('en', "I'd like to request a feature:", 'request');
manager.addDocument('en', "I need this part to be updated:", 'request');
manager.addDocument('en', "Please help me with this change:", 'request');
manager.addDocument('en', "Could you assist me in implementing", 'request');
manager.addDocument('en', "I'm looking for an improvement in", 'request');
manager.addDocument('en', "Would you mind adding support for", 'request');
manager.addDocument('en', "I want you to change", 'request');

manager.addDocument('en', "Can you provide more details?", 'question');
manager.addDocument('en', "Could you explain further?", 'question');
manager.addDocument('en', "I'd like more information about this.", 'question');
manager.addDocument('en', "Could you help me understand better?", 'question');
manager.addDocument('en', "Can you clarify something for me?", 'question');
manager.addDocument('en', "I need more info on this topic.", 'question');
manager.addDocument('en', "Can you explain the process?", 'question');
manager.addDocument('en', "What are the steps to do this?", 'question');
manager.addDocument('en', "I'm curious about how to", 'question');
manager.addDocument('en', "What's the procedure to", 'question');
manager.addDocument('en', "Can you provide guidance on", 'question');
manager.addDocument('en', "I'm interested in learning more about", 'question');
manager.addDocument('en', "Can you provide insights into", 'question');
manager.addDocument('en', "Could you share more details about", 'question');
manager.addDocument('en', "I'm looking for information on", 'question');
manager.addDocument('en', "Can you give me more context on", 'question');
manager.addDocument('en', "What's the recommended way to", 'question');

manager.addDocument('en', "Great job on", 'positive');
manager.addDocument('en', "I'm impressed by", 'positive');
manager.addDocument('en', "Well done with", 'positive');
manager.addDocument('en', "I love", 'positive');
manager.addDocument('en', "You're amazing at", 'positive');
manager.addDocument('en', "Kudos for", 'positive');
manager.addDocument('en', "Excellent work on", 'positive');
manager.addDocument('en', "I'm grateful for", 'positive');
manager.addDocument('en', "You've done an awesome job on", 'positive');
manager.addDocument('en', "I'm so pleased with", 'positive');
manager.addDocument('en', "Bravo for", 'positive');
manager.addDocument('en', "I appreciate your work on", 'positive');
manager.addDocument('en', "Your effort on", 'positive');
manager.addDocument('en', "You've exceeded my expectations with", 'positive');
manager.addDocument('en', "Thanks for your support.", 'positive');
manager.addDocument('en', "I appreciate your help.", 'positive');
manager.addDocument('en', "You've been so helpful.", 'positive');
manager.addDocument('en', "Great job sending the info.", 'positive');
manager.addDocument('en', "You're the best.", 'positive');
manager.addDocument('en', "I'm grateful for your assistance.", 'positive');
manager.addDocument('en', "good", 'positive');
manager.addDocument('en', "great", 'positive');


manager.addDocument('en', "I'm disappointed with", 'negative');
manager.addDocument('en', "Not satisfied with", 'negative');
manager.addDocument('en', "I'm frustrated by", 'negative');
manager.addDocument('en', "I'm displeased with", 'negative');
manager.addDocument('en', "Unhappy about", 'negative');
manager.addDocument('en', "I'm not impressed by", 'negative');
manager.addDocument('en', "I'm dissatisfied with", 'negative');
manager.addDocument('en', "I'm not happy with", 'negative');
manager.addDocument('en', "I'm frustrated with", 'negative');
manager.addDocument('en', "I'm not pleased with", 'negative');
manager.addDocument('en', "I'm not satisfied with", 'negative');
manager.addDocument('en', "I'm underwhelmed by", 'negative');
manager.addDocument('en', "I'm let down by", 'negative');
manager.addDocument('en', "I'm annoyed by", 'negative');
manager.addDocument('en', "I'm concerned about", 'negative');
manager.addDocument('en', "I'm bothered by", 'negative');
manager.addDocument('en', "This isn't helpful.", 'negative');
manager.addDocument('en', "I'm disappointed with the aid options.", 'negative');
manager.addDocument('en', "I wish there were better options.", 'negative');
manager.addDocument('en', "I'm not satisfied with the financial aid.", 'negative');
manager.addDocument('en', "This is frustrating.", 'negative');
manager.addDocument('en', "These options are disappointing.", 'negative');
manager.addDocument('en', "ok", 'negative');



(async () => {
    await manager.train();
    manager.save();
})();

class classificationModel {
    static async classifyConversation(conversation) {
        const classifiedConversation = [];

        for (let message of conversation) {
            const analysis = await manager.process('en', message)
            classifiedConversation.push({ sentence: analysis.utterance, classification: analysis.classification })
        }

        return classifiedConversation
    }

    static async classifySentences(input) {
        const splitSentences = input.split(/(?<=[.?!;])\s+/);
        const classifiedSentences = [];

        for (let sentence of splitSentences) {
            const analysis = await manager.process('en', sentence)
            classifiedSentences.push({ sentence: analysis.utterance, classification: analysis.classifications })
        }

        return classifiedSentences
    }

    static async classifySentence(input) {
        const analysis = await manager.process('en', input)

        return { sentence: analysis.utterance, classification: analysis.classification }
    }
}

async function main() {
    const response = await classificationModel.classifySentences('Hi Wallace. This is your daily check-in. How are you doing today?');
    console.log(response);
}

main();


module.exports = classificationModel;