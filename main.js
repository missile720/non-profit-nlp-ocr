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
            const conversationIds = Object.keys(chunk);
            conversationIds.forEach(conversationId => {
                let imagesData = filterBase64Data(chunk[conversationId]);

                if(imagesData.length > 0){
                    imagesData.forEach(imageData => {
                        performOCR(imageData);
                    })
                }

                sentiment.process(conversationId, chunk[conversationId])
            });
        });

    feedbackStream
        .on("close", () => {
            sentiment.logSentimentStats();
        })
})();

function filterBase64Data(messages) {
    let imagesData = [];
    messages.forEach(message => {
        if(message.body.startsWith("data:image")){
            imagesData.push(message.body);
        }
    });

    return imagesData;
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

    console.log("\n--------Image Text--------");
    console.log(text);
    await worker.terminate();
}