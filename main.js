const fs = require("fs");
const csv = require("csv-parser");
const { SentimentManager } = require("node-nlp");

const headers = [
    "feedback_id",
    "user_id",
    "feedback"
];

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

    const streamResults = [];
    
    feedbackStream
        .pipe(csv({
            headers: headers,
            skipLines: 1
        }))
        .on("data", (chunk) => {
            sentiment
                .process("en", chunk["feedback"])
                .then(result => console.log({
                    ...chunk,
                    id: chunk["feedback_id"],
                    sentiment_analysis: result
                }));
        });

    // feedbackStream
    //     .on("end", () => console.log(streamResults));

    // feedbackStream
    //     .on("close", () => console.log(streamResults));
})()