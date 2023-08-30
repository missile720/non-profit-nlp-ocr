const fs = require("fs");
const path = require("path");
const JSONStream = require("JSONStream");
const { createWorker } = require("tesseract.js");

const SentimentStatisticTracker = require("./utils/sentimentAnalysis.js");

// File Utils
/**
 * @param {string} file A string specifying a file
 * @returns {bool} If a file is a JSON file
 */
const isJson = (file) => {
    return path.extname(file).toLowerCase() === ".json";
}

// Main Driver
(async () => {
    // --------OCR--------
    // const worker = await createWorker({
    //     logger: (m) => console.log(m),
    // });

    // await worker.loadLanguage("eng");
    // await worker.initialize("eng");
    // const {
    //     data: { text },
    // } = await worker.recognize(
    //     "https://tesseract.projectnaptha.com/img/eng_bw.png"
    // );
    // console.log("imageText: ",text);
    // await worker.terminate();

    // --------JSON Processing/Sentiment Analysis--------
    const feedbackJsonFile = process.argv[2];

    if (!isJson(feedbackJsonFile)) {
        console.log(`${feedbackJsonFile} is not a .json file, program terminating`);
        return;
    }

    const feedbackStream = fs.createReadStream(feedbackJsonFile, "utf-8");

    feedbackStream.on("error", (error) => {
        if (error.code === "ENOENT") {
        console.log(
            `File ${feedbackJsonFile} does not exist, please pass a valid file`
        );
        } else {
            console.log(error);
        }
    });

    const sentiment = new SentimentStatisticTracker();

    // Assumes the main JSON will only have a singular member, messages,
    // which will have separate members for sms conversations to process
    feedbackStream.pipe(JSONStream.parse("messages"))
        .on("data", chunk => {
            // chunk.forEach(feedbackEntry => sentiment.process(feedbackEntry));
            const conversationIds = Object.keys(chunk);
            conversationIds.forEach(conversationId => 
                sentiment.process(conversationId, chunk[conversationId])
            );
        });

    feedbackStream
        .on("close", () => {
            console.log("----Average Sentiment Per User--------");
            sentiment.userScores.forEach((value, key) => {
                const userSentiment = sentiment.getAverageSentimentForUser(key);

                console.log(`User of id [${key}] has an average ${sentiment.getSentimentVote(userSentiment)} sentiment of ${userSentiment.toFixed()}`);

            });

            const averageSentiment = sentiment.calcOverallAverageSentiment(sentiment.sentimentScores);
            console.log(`Average sentiment of dataset is ${sentiment.getSentimentVote(averageSentiment)} with a score of ${averageSentiment.toFixed()}`);
        })
})();
