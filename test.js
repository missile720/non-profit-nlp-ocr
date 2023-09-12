const textClassifier = require('./utils/textClassifier.js');
const sentences = [
    "Hey, have you heard about the new movie coming out this weekend?",
    "No, I haven't. What's it called?",
    "It's called 'The Enigma.' It's a sci-fi thriller with some mind-bending twists.",
    "Wow, that sounds intriguing. Who's in the cast?",
    "The lead actor is a rising star, and there are a few veteran actors too.",
    "I'm a fan of sci-fi. I'll definitely check it out.",
    "Great! Let's plan to watch it together on Saturday night.",
    "Sounds like a plan. I'll bring the popcorn!",
    "By the way, did you manage to fix that issue with your computer?",
    "Not yet. I tried a few things, but it's still acting up.",
    "You might want to try contacting tech support. They could help.",
    "I'll give that a shot. Thanks for the advice.",
    "No problem. Let me know how it goes!",
];



(async () => {
    // for (let sentence of sentences) {
    //     const classifiedSentence = await textClassifier.classifySentence(sentence);
    //     console.log(classifiedSentence.sentence, classifiedSentence.classification[0])
    // }
    const classifiedSentence = await textClassifier.classifySentence(sentences[3]);
    console.log(classifiedSentence)
    //console.log(classifiedSentence.sentence, classifiedSentence.classification[0])
})();