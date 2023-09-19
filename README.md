
# non-profit-nlp-ocr
A cli tool for analyzing messages, images, and documents to extract any potential opportunities of improvement within a non-profit organization.


## Installation and Usage

Begin by cloning the git repo
```
  git clone https://github.com/missile720/non-profit-nlp-ocr.git
```
Install the necessary packages
```
  npm install
```
Run the tool by referencing the file you want to analyze.
```
  node main.js data/sample/non-profit-sms-messages.json
```
Here is what you should see if you run the tool by giving it the sample data provided.
```
data/sample/non-profit-sms-messages.json processing has begun...

--------Complaints--------
----dont,afford
----chance,send
----helpful,dont qualify,im,disappointed,offered,financial aid
----qualify,financial aid programs
----disappointing,offer,classes,single parents
----number,classes,free including,free online parenting class,send,information shortly
----ugh,guess ill,wait till,back,dont,talk
----hate,organization,helpful,absent

--------Ideas--------
----registered,single parent classes
----understand,send,information,financial aid
----receive,flyer
----hide,wanted,office tomorrow,dianne,check
----understand dianne,fantastic person,talk,promise,enjoy talking
----feel,back,office,wednesday,talk,hope,great day

--------Average Sentiment Per Conversation--------
Conversation [laura.whitaker-wallace.foster] has an average postive sentiment of 0.52525000000000001667
        ---- User of id [laura.whitaker] has a postive sentiment of 0.9666
        ---- User of id [wallace.foster] has a postive sentiment of 0.21000000000000002857
Conversation [winston.ledford-dianne.shaw] has an average postive sentiment of 0.08566666666666666667
        ---- User of id [dianne.shaw] has a postive sentiment of 0.68766666666666666667
        ---- User of id [winston.ledford] has a negative sentiment of -0.51633333333333333333
Conversation [asuka-ito-hideyoshi-sato] has an average postive sentiment of 1.00966666666666675
        ---- User of id [asuka.ito] has a postive sentiment of 3.43933333333333353333
        ---- User of id [hideyoshi.sato] has a negative sentiment of -1.42000000000000003333

--------Average Sentiment Per User--------
User of id [laura.whitaker] has a postive sentiment of 0.9666
User of id [wallace.foster] has a postive sentiment of 0.21000000000000002857
User of id [dianne.shaw] has a postive sentiment of 0.68766666666666666667
User of id [winston.ledford] has a negative sentiment of -0.51633333333333333333
User of id [asuka.ito] has a postive sentiment of 3.43933333333333353333
User of id [hideyoshi.sato] has a negative sentiment of -1.42000000000000003333

Average sentiment of dataset is postive with a score of 0.5364583333333333625
```
## Limitations

#### OCR 
Tesseract package is the best we have for OCR.It can handle plain text OCR good but can struggle for mixed and stylized font/typeface
#### Sample Data
The sample data we were given only has a few conversations, so our script isn’t tested as rigorously against expected data.
#### Training Data 
Given we’re a six person team, the training data made is more limited based on what we could make. The text classification could be improved with more training data and time which we do not have.
#### Language Support 
Sentiment Analysis has Spanish support due to the nature of how our satisfaction is calculated using Senticonn Sentiment Analysis, but Text Classification for Complaints/Ideas would necessitate generating even more training data in Spanish, which we didn’t have time for.

## Improving the Model
As mentioned, the classification model can be improved by training it with more data. You can add that training data inside the **englishTextClassificationModel.js** file. You can find examples on how to do that by following the [node-nlp documentation](https://github.com/axa-group/nlp.js#example-of-use).

```javascript
const { NlpManager } = require('node-nlp');
const manager = new NlpManager({ languages: ['en'], forceNER: true });

manager.addDocument('en', "Could you make this change?", 'request'); 

...

(async () => {
    await manager.train();
    manager.save();
})();
``` 
After adding data to that file, you can train the model with your new training data by running the follwing command:
```
npm run update-model

```
