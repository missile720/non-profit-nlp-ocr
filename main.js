const fs = require("fs");
const path = require("path");
const JSONStream = require("JSONStream");
const { createWorker } = require("tesseract.js");

const SentimentStatisticTracker = require("./utils/sentimentAnalysis.js");

// File Utility Functions
/**
 * @param {string} file A string specifying a file
 * @returns {bool} If a file is a JSON file
 */
function isJson(file) {
    return path.extname(file).toLowerCase() === ".json";
}

// Processing Functions
async function processMessage(sentiment, conversationId, message) {
    const imageData = filterBase64Data(message.body);
    const imageContent = imageData && await performOCR(imageData);

    if (!imageContent) {
        sentiment.process(conversationId, message);
    }
}

// Main Driver
(async () => {
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
    console.log(`${feedbackJsonFile} processing has begun...`);

    // Assumes the main JSON will only have a singular member, messages,
    // which will have separate members for sms conversations to process
    feedbackStream.pipe(JSONStream.parse("messages"))
        .on("data", async chunk => {
            const conversationIds = Object.keys(chunk);

            await Promise.all(
                conversationIds.map(async conversationId => {
                    const messages = chunk[conversationId];

                    await Promise.all(messages.map(message => 
                        processMessage(sentiment, conversationId, message)
                    ));
                })
            );

            sentiment.logSentimentStats();
        });
})();

function filterBase64Data(messageContent) {
    if (messageContent.startsWith("data:image")){
        return messageContent;
    }

    return null;
}

async function performOCR(base64Image) {
    const worker = await createWorker();

    await worker.loadLanguage("eng");
    await worker.initialize("eng");

    const base64Data = base64Image.replace(/^data:image\/(png|jpeg);base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");

    const {
        data: { text },
    } = await worker.recognize(imageBuffer);

    await worker.terminate();

    return text;
}