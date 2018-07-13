const AWS = require('aws-sdk')
const textract = require('textract')

const pattern = /(?:(?:.*[.!?\|])|^)(.*?vegan.*?[.!?\|])/ig

function getJsonFromS3 (event) {
  return new Promise((res, rej) => {
    // Get JSON from S3 Bucket
    const s3 = new AWS.S3()

    const sourceBucket = event.Records[0].s3.bucket.name
    const sourceKey = event.Records[0].s3.object.key

    console.log(`Getting record from ${sourceBucket}/${sourceKey}`)

    s3.getObject({
      Bucket: sourceBucket,
      Key: sourceKey
    }, (err, data) => {
      if (err) {
        console.log(err)
        rej(err)
        return
      }

      const jsonObj = JSON.parse(data.Body.toString())
      console.log(`JSON read from S3 file ${sourceBucket}/${sourceKey}`)
      res(jsonObj)
    })
  })
}

function enrichRecordWithContext (record) {
  return new Promise((res, rej) => {
    // Get the context of 'vegan' in the article
    textract.fromUrl(record.url, {preserveLineBreaks: true}, (err, page) => {
      if (err) {
        console.log(err)
        rej(err)
        return
      }

      // check for index of word vegan in \n split string
      // if there is vegan in there, do regex, otherwise use whole string
      const texts = page
        .split('\n')
        .filter(text => text.indexOf('vegan') > -1)
        .map(text => {
          const match = pattern.exec(text)

          return match ? match[1].trim() : text.trim()
        })
        .join('\n')

      // only use title and description if they contain 'vegan'
      record.context = `
          ${record.title.indexOf('vegan') > -1 ? record.title : ''}
          ${record.description.indexOf('vegan') > -1 ? record.description : ''}
          ${texts}
          `.trim()

      console.log('Record enriched with context of vegan keywords')
      res(record)
    })
  })
}

function analyseContext (record) {
  return new Promise((res, rej) => {
    // Enriching the record with sentiment analysis
    const comprehend = new AWS.Comprehend()

    const params = {
      LanguageCode: 'en',
      Text: record.context
    }

    comprehend.detectSentiment(params, (err, data) => {
      if (err) {
        console.log(err)
        rej(err)
        return
      }

      record.sentiment = data['Sentiment']
      record.sentimentScore = data['SentimentScore']

      console.log('Record enriched with sentiment analysis of the context')
      res(record)
    })
  })
}

function writeToDynamoDB (record) {
  return new Promise((res, rej) => {
    // Add primary key to record
    record.articleID = record.context
      .split('')
      .map(v => v.charCodeAt(0))
      .reduce((a, v) => a+((a<<7)+(a<<3))^v)
      .toString(16)

    // Writing the record data to dynamoDB
    const params = {
      TableName : process.env.TABLE,
      Item: record
    }

    const documentClient = new AWS.DynamoDB.DocumentClient()

    documentClient.put(params, (err) => {
      if (err) {
        console.log(err)
        rej(err)
        return
      }

      console.log('Record written to DynamoDB')
      res()
    })
  })
}

exports.handler = async (event) => {
  return new Promise((resolve, reject) => getJsonFromS3(event)
    .then(record => enrichRecordWithContext(record))
    .then(record => analyseContext(record))
    .then(record => writeToDynamoDB(record))
    .then(result => resolve())
    .catch(err => reject(err))
  )
}

