const fs = require("fs");
const path = require("path");
const JSONStream = require("JSONStream");
const { createWorker } = require("tesseract.js");

const textClassifier = require("./utils/textClassifier.js");
const SentimentStatisticTracker = require("./utils/sentimentAnalysis.js");
const guessLanguage = require("./utils/languageGuesserModel.js")

// File Utility Functions
/**
 * @param {string} file A string specifying a file
 * @returns {bool} If a file is a JSON file
 */
function isJson(file) {
    return path.extname(file).toLowerCase() === ".json";
}

// OCR Utility Functions
/**
 * @param {string} messageContent A string that might contain base64 image data
 * @returns {string} A string if the messageContent was base64 image data or null
 * otherwise 
 */
function filterBase64Data(messageContent) {
    if (messageContent.startsWith("data:image")){
        return messageContent;
    }

    return null;
}

/**
 * @param {string} base64Image A image in base64
 * @returns {string} The text content of the image
 */
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

// Processing Functions
/**
 * Processes each message passed by extracting image content with OCR
 * if possible and performing sentiment analysis
 * @param {SentimentStatisticTracker} sentiment The sentiment analysis
 * object used for tracking sentiment stats 
 * @param {string} conversationId The id for the conversation a message
 * was sent in
 * @param {Object} message An object containing:
 * -sender {string} The userId of the person who sent the message
 * -body {string} The body of the message the sender sent
 * @param {string[][]} complaintKeywords An array of keywords classified 
 * as a complaint
 * @param {string[][]} ideaKeywords An array of keywords classified 
 * as an idea
 */
async function processMessage(sentiment, conversationId, message, complaintKeywords, ideaKeywords) {
    const imageData = filterBase64Data(message.body);
    const imageContent = imageData && await performOCR(imageData);
    const languageGuess = guessLanguage(imageContent || message.body);
    const classification = await textClassifier.classifySentence(imageContent || message.body);

    
    
    sentiment.setLanguage(languageGuess.alpha2);
    const sentimentScore = !imageContent 
        ? await sentiment.process(conversationId, message) 
        : 0;

    const label = classification.classification.label;
    if(sentimentScore <0){
        complaintKeywords.push(classification.keyWords);
    }else if (['request','question','negative'].includes(label)){
        if(label =='request' || label == 'question'){
            ideaKeywords.push(classification.keyWords);
        }else{
            complaintKeywords.push(classification.keyWords);
        }
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
    const complaintKeywords = [];
    const ideaKeywords =[];
    console.log(`${feedbackJsonFile} processing has begun...`);

    // Assumes the main JSON will only have a singular member, messages,
    // which will have separate members for sms conversations to process
    feedbackStream.pipe(JSONStream.parse("messages"))
        .on("data", async chunk => {
            const conversationIds = Object.keys(chunk);

            await Promise.all(
                conversationIds.map(async conversationId => {
                    const messages = chunk[conversationId];

                    await Promise.all(messages.map(async message => 
                        await processMessage(sentiment, 
                            conversationId, 
                            message, 
                            complaintKeywords, 
                            ideaKeywords)
                    ));
                })
            );

            console.log();
            console.log("--------Complaints--------");
            // keyWord.length filters for sentences that didn't have significant keywords
            complaintKeywords.forEach(keyWord => keyWord.length && console.log(`----${keyWord}`)); 
            
            console.log();
            console.log("--------Ideas--------");
            // keyWord.length filters for sentences that didn't have significant keywords
            ideaKeywords.forEach(keyWord => keyWord.length && console.log(`----${keyWord}`));
            
            console.log()
            sentiment.logSentimentStats();
        });
})();

