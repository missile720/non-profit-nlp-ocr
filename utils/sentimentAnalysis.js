const { SentimentManager } = require("node-nlp");
const { default: BigNumber } = require("bignumber.js");

// Object to handle the sentiment analysis tracking
class SentimentStatisticTracker {
    constructor() {
        this.sentimentManger = new SentimentManager();
        this.sentimentScores = [];
        // Maps individual arrays for each user and 
        // their associated sentiment scores
        this.userScores = new Map(); 
        this.language = "en";
    }

    /**
     * Adds a sentiment score to the tracker's computed sentimentScores,
     * and associates the score with a user
     * @param {Number} sentimentScore A computed sentiment score
     * @param {string} userId A string indicating the id of the user whose
     * feedback was scord
     */
    addScore(sentimentScore, userId) {
        const newScore = new BigNumber(sentimentScore);

        this.sentimentScores.push(newScore);

        if (!this.userScores.has(userId)) {
            this.userScores.set(userId, []);
        }

        this.userScores.get(userId).push(newScore);
    }

    /**
     * Processes a feedback entry by calculating its feedback and adding it 
     * to the total sentimentScores calculated
     * @param {Object} feedbackEntry An object consisting of a feedback_id,
     * user_id, and a feedback entry, which contains a string from which we
     * can process the sentiment of
     */
    process(feedbackEntry) {
        this.sentimentManger.process(this.language, feedbackEntry.feedback)
            .then(result => {
                this.addScore(result.score, feedbackEntry["user_id"]);

                console.log({
                    ...feedbackEntry,
                    "sentiment_analysis": result
                });
            });
    }

    /**
     * @returns {BigNumber} The average sentiment of sentimentScores
     */
    calcOverallAverageSentiment() {
        return this.calcAverageSentiment(this.sentimentScores);
    }

    /**
     * 
     * @param {string} userId 
     * @returns {BigNumber}
     */
    getAverageSentimentForUser(userId) {
        return this.calcAverageSentiment(this.userScores.get(userId));
    }

    /**
     * Given an array of sentiment scores, returns that array's average
     * @param {BigNumber[]} sentiments An array of sentiment scores
     * @returns {BigNumber} The average sentiment of the sentiments
     */
    calcAverageSentiment(sentiments) {
        const scoresAmt = sentiments.length;

        // Avoids divide by 0 error
        if (scoresAmt === 0) {
            return 0;
        }

        let averageSentiment = new BigNumber(0);


        sentiments.forEach(score => 
            averageSentiment = averageSentiment.plus(score)
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
    getSentimentVote(sentimentScore) {
        if (sentimentScore.isEqualTo(0)) return "neutral";

        return sentimentScore.isGreaterThan(0) ? "postive" : "negative";
    }
}

module.exports = SentimentStatisticTracker;

