const fs = require("fs");
const csv = require("csv-parser");

const headers = [
    "feedback_id",
    "user_id",
    "feedback"
];

// Main Driver
(() => {
    const feedbackCsvFile = process.argv[2];

    const feedbackStream = fs.createReadStream(feedbackCsvFile, "utf-8")
        
    feedbackStream.on("error", (error) => {
        if (error.code === "ENOENT") {
            console.log(`File ${feedbackCsvFile} does not exist, please pass valid file`);
        } else {
            console.log(error)
        }
    });
    
    feedbackStream
        .pipe(csv({
            headers: headers,
            skipLines: 1
        }))
        .on("data", (chunk) => {
            console.log(chunk);
        });

    feedbackStream
        .on("end", () => console.log(`${feedbackCsvFile} has been processed.`));

    feedbackStream
        .on("close", () => console.log(`${feedbackCsvFile} stream has been closed.`))
})()