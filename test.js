const textClassifier = require('./utils/textClassifier.js');
const sentences = [
    "Hi Wallace. This is your daily check-in. How are you doing today?",
    "hi. im ok. just a little tired",
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


(async () => {

    const classifiedConversation = await textClassifier.classifyConversation(sentences);
    console.log(classifiedConversation)

})();