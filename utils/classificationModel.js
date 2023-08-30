const { NlpManager } = require('node-nlp');

const manager = new NlpManager({ languages: ['en'], forceNER: true });

manager.addDocument('en', "Maybe you should", 'request');
manager.addDocument('en', "It would be cool if", 'request');
manager.addDocument('en', "It would be great if", 'request');
manager.addDocument('en', "It should", 'request');
manager.addDocument('en', "Could you", 'request');
manager.addDocument('en', "Perhaps you", 'request');
manager.addDocument('en', "Maybe instead", 'request');
manager.addDocument('en', "Is it possible to", 'request');
manager.addDocument('en', "Can you", 'request');
manager.addDocument('en', "I'd like to request", 'request');
manager.addDocument('en', "I need", 'request');
manager.addDocument('en', "Please help me with", 'request');
manager.addDocument('en', "Could you assist me in", 'request');
manager.addDocument('en', "I'm looking for", 'request');
manager.addDocument('en', "Would you mind", 'request');
manager.addDocument('en', "I want you to", 'request');
manager.addDocument('en', "I'm interested in", 'request');
manager.addDocument('en', "Can you provide", 'request');
manager.addDocument('en', "Could you provide more details?", 'request');
manager.addDocument('en', "Can you explain further?", 'request');
manager.addDocument('en', "I'd like more information about the aid.", 'request');
manager.addDocument('en', "Could you help me understand better?", 'request');
manager.addDocument('en', "Can you clarify something?", 'request');
manager.addDocument('en', "I need more info on this.", 'request');


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



(async () => {
    await manager.train();
    manager.save();
    const conversation = [
        "Hi Wallace. This is your daily check-in. How are you doing today?",
        "hi. im ok. just a little tired",
        "just a little tired",
        "I'm sorry to hear that. I hope you feel better soon.",
        "thanks",
        "I'm here if you need anything. Have you registered for single parent classes yet?",
        "no. i dont think i can afford it",
        "I understand. I'll send you some information about financial aid.",
        "ok",
        "hi did you send that information yet?",
        "I'm sorry, I haven't had a chance to yet. I'll send it to you now.",
        "ok",
        "this is not helpful. i dont qualify for any of these. im very disappointed. i wish you offered better financial aid"
    ];

    for (message of conversation) {
        const analysis = await manager.process('en', message)
        console.log(analysis.utterance, analysis.classifications)
    }

})();

module.exports = manager;