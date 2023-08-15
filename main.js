const fs = require("fs");
const path = require("path");
const JSONStream = require("JSONStream");
const { SentimentManager } = require("node-nlp");
const { createWorker } = require("tesseract.js");
const { default: BigNumber } = require("bignumber.js");

// File Utils
/**
 * @param {string} file A string specifying a file
 * @returns {bool} If a file is a JSON file
 */
const isJson = (file) => {
    return path.extname(file).toLowerCase() === ".json";
}

// Sentiment Analysis Utils
/**
 * @param {BigNumber[]} sentimentScores An array of computed sentiment
 * scores from the JSON file of feedback
 * @returns {BigNumber} The average sentiment of the sentimentScores
 */
const calcAverageSentiment = (sentimentScores) => {
    const scoresAmt = sentimentScores.length;

    // Avoids divide by 0 error
    if (scoresAmt === 0) {
        return 0;
    }

    let averageSentiment = new BigNumber(0);

    sentimentScores.forEach(score => 
        averageSentiment = score.plus(averageSentiment)
    );

    return averageSentiment.dividedBy(scoresAmt);
}

/**
 * Returns the vote of a sentiment score, whether or not a computed
 * sentiment was neutral, positive, or negative, based on senticon scoring,
 * the lexicon scoring system used by the SentimentManager to compute
 * sentiment per message
 * @param {BigNumber} sentimentScore A sentiment score
 * @returns {string} The vote of the score based on senticon scoring
 */
const getSentimentVote = (sentimentScore) => {
    if (sentimentScore.isEqualTo(0)) return "neutral";

    return sentimentScore.isGreaterThan(0) ? "postive" : "negative";
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

    const sentimentScores = [];

    const sentiment = new SentimentManager();

    // Assumes the main JSON will only have a singular member which will
    // be structured as an array of all feedback entries, wherein the
    // user's written feedback will be in a member called "feedback"
    feedbackStream.pipe(JSONStream.parse("*"))
        .on("data", chunk => {
            chunk.forEach(feedbackEntry => {
                sentiment.process("en", feedbackEntry.feedback).then(result => {
                    sentimentScores.push(new BigNumber(result.score));

                    console.log({
                        ...feedbackEntry,
                        sentiment_analysis: result
                    });
                });
            });
        });

    feedbackStream
        .on("close", () => {
            const averageSentiment = calcAverageSentiment(sentimentScores);
            console.log(`Average sentiment of dataset is ${getSentimentVote(averageSentiment)} with a score of ${averageSentiment.toFixed()}`);
        })
})();
