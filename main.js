const fs = require("fs");
const JSONStream = require("JSONStream");
const { SentimentManager } = require("node-nlp");

// Main Driver
(() => {
    const feedbackCsvFile = process.argv[2];

    const feedbackStream = fs.createReadStream(feedbackCsvFile, "utf-8");
        
    feedbackStream.on("error", (error) => {
        if (error.code === "ENOENT") {
            console.log(`File ${feedbackCsvFile} does not exist, please pass valid file`);
        } else {
            console.log(error)
        }
    });

    const sentiment = new SentimentManager();

    // Assumes the main JSON will only have a singular member which will
    // be structured as an array of all feedback entries, wherein the 
    // user's written feedback will be in a member called "feedback"
    feedbackStream
        .pipe(JSONStream.parse("*"))
        .on("data", (chunk) => {
            chunk.forEach(feedbackEntry => {
                sentiment.process("en", feedbackEntry.feedback)
                    .then(result => console.log({
                        ...feedbackEntry,
                        sentiment_analysis: result
                    }));
            })
        });
})()