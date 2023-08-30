const { SentimentManager } = require("node-nlp");
const { default: BigNumber } = require("bignumber.js");

// Object to handle the sentiment analysis tracking
class SentimentStatisticTracker {
    constructor() {
        this.sentimentManger = new SentimentManager();
        this.sentimentScores = [];
        // Maps each user to their overall average sentiment score
        // from the JSON
        this.userScores = new Map();
        // Maps each conversation to their individual sentiment
        // score and a map of each user's average sentiment score
        // for that conversation
        this.conversationScores = new Map();
        this.language = "en";
    }

    /**
     */
    addScore(conversationId, userId, sentimentScore) {
        const newScore = new BigNumber(sentimentScore);

        this.sentimentScores.push(newScore);

        // if (!this.conversationScores.has(conversationId)) {
        //     this.conversationScores.set(conversationId, null);
        // }

        this.addUserScore(this.userScores, userId, newScore);
    }

    addUserScore(userScores, userId, newScore) {
        if (!userScores.has(userId)) {
            userScores.set(userId,
                {
                    scores: [],
                    averageScore: null
                }    
            )
        }

        const userScore = userScores.get(userId);
        userScore.scores.push(newScore);
        userScore.averageScore = this.calcRunningAverage(
            userScore.averageScore, newScore, userScore.scores.length
        );
    }

    addConversationScore(conversationId, userId, newScore) {
        
    }

    /**
     * @param {string} conversationId
     * @param {Object[]} messages
     */
    process(conversationId, messages) {
        messages.forEach(message => 
            this.sentimentManger.process(this.language, message.body)
                .then(result => {
                    if (message.body.length < 1000)
                    // console.log(message.sender, message.body, result.score);
                    this.addScore(message.sender, message.sender, result.score);
                })
        );
    }

    /**
     * Calculates the running average of a set of user scores using the 
     * Welford's Method 
     * (https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Welford's_online_algorithm)
     * @param {BigNumber} mk The current running average
     * @param {BigNumber} xk The new score to add to a running averag
     * @param {Number} k The length of the scores to calculate from
     * @returns 
     */
    calcRunningAverage(mk, xk, k) {
        // Start of the running average calulation, simply return the
        // first score to add, which in our case is xk [which can be considered
        // x1]
        if (mk === null) {
            return xk;
        }

        const xkMinusMk = xk.minus(mk);
        const welfordDifference = xkMinusMk.dividedBy(k);

        return mk.plus(welfordDifference);
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
        return this.userScores.get(userId).averageScore;
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

