const fs = require("fs");
const path = require("path");
const JSONStream = require("JSONStream");
const { SentimentManager } = require("node-nlp");
const { createWorker } = require("tesseract.js");


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
    const worker = await createWorker({
        logger: (m) => console.log(m),
    });

    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    const {
        data: { text },
    } = await worker.recognize(
        "https://tesseract.projectnaptha.com/img/eng_bw.png"
    );
    console.log("imageText: ",text);
    await worker.terminate();

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

    const sentiment = new SentimentManager();

    // Assumes the main JSON will only have a singular member which will
    // be structured as an array of all feedback entries, wherein the
    // user's written feedback will be in a member called "feedback"
    feedbackStream.pipe(JSONStream.parse("*")).on("data", (chunk) => {
        chunk.forEach((feedbackEntry) => {
        sentiment.process("en", feedbackEntry.feedback).then((result) =>
            console.log({
            ...feedbackEntry,
            sentiment_analysis: result,
            })
        );
        });
    });
})();
