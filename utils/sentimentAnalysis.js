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
        this.supportedLanguges = ["en", "es"]
    }
    
    // --------MAIN METHODS--------
    /**
     * Processes a message from a conversation and tracks 
     * the overall sentiment from the conversation and participants in 
     * the conversation
     * @param {string} conversationId The id of the conversation, 
     * specifying the participants of the conversation as well as the 
     * identifier for the conversation in this.conversationScores
     * @param {Object} message An object containing:
     * -sender {string} The userId of the person who sent the message
     * -body {string} The body of the message the sender sent
     */
   process(conversationId, message) {
        this.sentimentManger.process(this.language, message.body)
            .then(result => {
                this.addScore(conversationId, message.sender, result.score);
            });
    }
    
    /**
     * Logs relevant sentiment stats regarding overall satisfaction 
     * calculated 
     */
    logSentimentStats() {
        console.log("--------Average Sentiment Per Conversation--------");
        this.conversationScores.forEach((value, key) => {
            const conversationScore = this.conversationScores.get(key);
            const conversationVote = this.getSentimentVote(conversationScore.averageScore);
            console.log(`Conversation [${key}] has an average ${conversationVote} sentiment of ${conversationScore.averageScore.toFixed()}`);
            
            conversationScore.userScores.forEach((value, key) => {
                console.log(
                    "\t----",
                    this.getUserSentimentStat(conversationScore.userScores, key)
                )
            });
        });
        console.log();

        console.log("--------Average Sentiment Per User--------");
        this.userScores.forEach((value, key) => 
            console.log(this.getUserSentimentStat(this.userScores, key))
        );
        console.log();

        const averageSentiment = this.calcOverallAverageSentiment(this.sentimentScores);
        console.log(`Average sentiment of dataset is ${this.getSentimentVote(averageSentiment)} with a score of ${averageSentiment.toFixed()}`);
    }

    // --------SETTERS--------
    /**
     * Sets the language for sentiment analysis to a given language 
     * if it supported
     * @param {string} language A supported alpha2 language string
     */
    setLanguage(language) {
        if (this.supportedLanguges.includes(language)) {
            this.language = language;
        }
    }

    // --------SENTIMENT STAT TRACKING HELPERS--------
    /**
     * Adds a sentiment score to the stat tracker by adding it to its
     * associated conversationScores and userScores.
     * @param {string} conversationId The id of the conversations a new
     * sentiment score is from
     * @param {string} userId The user associated with the new sentiment
     * score
     * @param {number} sentimentScore A computed sentiment score to 
     * process for stat tracking
     */
    addScore(conversationId, userId, sentimentScore) {
        const newScore = new BigNumber(sentimentScore);

        this.sentimentScores.push(newScore);

        this.addUserScore(this.userScores, userId, newScore);
        this.addConversationScore(conversationId, userId, newScore);
    }

    /**
     * Adds a given newScore to a given userId's userScores entry in order
     * to track overall satisfaction sentiment for that user in the given
     * userScores
     * @param {Map} userScores A map of a userId to an object consisting of
     * the following members:
     * -scores {BigNumber[]} An array of their sentimentScores
     * -averageScore {BigNumber} Their computed average sentiment score for 
     * this set of userScores
     * userScores can either be this.userScores or a conversationScore's
     * userScores (which store only the userScores that are also 
     * associated with that conversation)
     * @param {string} userId The user in userScores to associate the newScore
     * with
     * @param {BigNumber} newScore The sentiment score to process for the user
     */
    addUserScore(userScores, userId, newScore) {
        // If userScores doesn't contain the user, initialize the user
        // in the userScores map.
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

    /**
     * Adds a given newScore to this.conversationsScores in order to
     * track overall satisfaction sentiment for that conversation
     * @param {string} conversationId The id for a conversation in 
     * this.conversationScores
     * @param {string} userId The id for a user in this.userScores
     * as well as the userScores member in each conversationScore
     * @param {BigNumber} newScore The new sentiment score to associate
     * with the conversationId and userId
     */
    addConversationScore(conversationId, userId, newScore) {
        // If the conversationId does not exist in this.conversationScores,
        // initialize it
        if (!this.conversationScores.has(conversationId)) {
            this.conversationScores.set(conversationId, 
                {
                    scores: [],
                    averageScore: null,
                    // Maps each user's userScore per a 
                    // conversation
                    userScores: new Map()
                }    
            );
        }

        const conversationScore = this.conversationScores.get(conversationId);
        conversationScore.scores.push(newScore);
        conversationScore.averageScore = this.calcRunningAverage(
            conversationScore.averageScore, 
            newScore, 
            conversationScore.scores.length
        );
        // Used to track overall satisfaction of the user in this specific
        // conversation
        this.addUserScore(conversationScore.userScores, userId, newScore);
    }

    /**
     * Calculates the running average of a set of user scores using the 
     * Welford's Method 
     * (https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Welford's_online_algorithm)
     * @param {BigNumber} mk The current running average
     * @param {BigNumber} xk The new score to add to a running average
     * @param {Number} k The length of the scores to calculate from
     * @returns {BigNumber} The running average after adding xk
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
     * @returns {BigNumber} The average sentiment of sentimentScores
     */
    calcOverallAverageSentiment() {
        return this.calcAverageSentiment(this.sentimentScores);
    }

    // --------SENTIMENT STAT LOGGING HELPERS--------
    /**
     * @param {Map} userScores A map of userScores to check from
     * @param {string} userId The key value to check in userScores
     * @returns {BigNumber} The average sentiment score for the userId in 
     * userScores
     */
    getAverageSentimentForUser(userScores, userId) {
        return userScores.get(userId).averageScore;
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

    /**
     * @param {Map} userScores A map of userScores to check from
     * @param {string} userId The key value to check in userScores
     * @returns {string} A string to log, outputting the average sentiment
     * of the user in the given userScores as well as the overall tone of that
     * sentiment (negative, neutral, or positive)
     */
    getUserSentimentStat(userScores, userId) {
        const userSentiment = this.getAverageSentimentForUser(userScores, userId);
        const userVote = this.getSentimentVote(userSentiment);

        return `User of id [${userId}] has a ${userVote} sentiment of ${userSentiment.toFixed()}`;
    }
}

module.exports = SentimentStatisticTracker;

