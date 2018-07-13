// Imports the Google Cloud client library
const language = require('@google-cloud/language');

// Instantiates a client
const client = new language.LanguageServiceClient({
  keyFilename: "./stateOfVeganism-4b5e2d00415d.json"
});

// The text to analyze
const text = 'Hello, world!';

const document = {
  content: text,
  type: 'PLAIN_TEXT',
};

// Detects the sentiment of the text
client
  .analyzeSentiment({document: document})
  .then(results => {
    const sentiment = results[0].documentSentiment;

    console.log(JSON.stringify(results, null, 2))

    //console.log(`Text: ${text}`);
    //console.log(`Sentiment score: ${sentiment.score}`);
    //console.log(`Sentiment magnitude: ${sentiment.magnitude}`);
  })
  .catch(err => {
    console.error('ERROR:', err);
  });

/*
 Clearly Positive*	"score": 0.8, "magnitude": 3.0
 Clearly Negative*	"score": -0.6, "magnitude": 4.0
 Neutral	"score": 0.1, "magnitude": 0.0
 Mixed	"score": 0.0, "magnitude": 4.0

---

[
  {
    "sentences": [
      {
        "text": {
          "content": "Hello, world!",
          "beginOffset": -1
        },
        "sentiment": {
          "magnitude": 0.30000001192092896,
          "score": 0.30000001192092896
        }
      }
    ],
    "documentSentiment": {
      "magnitude": 0.30000001192092896,
      "score": 0.30000001192092896
    },
    "language": "en"
  }
]
*/
