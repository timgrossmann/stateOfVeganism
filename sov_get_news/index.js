const NewsAPI = require('newsapi')
const moment = require('moment')
const AWS = require('aws-sdk')

exports.handler = async (event) => {
  const toTS = moment().format('YYYY-MM-DDTHH:mm:ss')
  const fromTS = moment(toTS).subtract(1, 'hour').format('YYYY-MM-DDTHH:mm:ss')

  const newsapi = new NewsAPI(process.env.API_KEY)
  const s3 = new AWS.S3()
  const myBucket = process.env.S3_BUCKET

  // Get the news from the given timeframe
  return new Promise((resolve, reject) => {
    newsapi.v2.everything({
      q: '+vegan',
      pageSize: 100,
      from: fromTS,
      to: toTS
    })
      .then(response => {
        console.log(`Working with a total of ${response.articles.length} articles.`)

        // write all the documents to the S3-bucket
        const promisedArticles = response.articles.map(article => {
          const myKey = `sov_${article.publishedAt.replace(/[^\w\s]/gi, '-')}.json`

          const params = {Bucket: myBucket, Key: myKey, Body: JSON.stringify(article, null, 2)}

          return new Promise((res, rej) => {
            s3.putObject(params, (err, data) => {
              if (err) {
                console.error(`Problem with persisting article to S3... ${err}`)
                rej(err)
                return
              }

              console.log(`Successfully uploaded data to ${myBucket}/${myKey}`)
              res(`Successfully uploaded data to ${myBucket}/${myKey}`)
            })
          })
        })
    })
      .catch(err => {
        console.error(`Encountered a problem... ${err}`)
        reject(err)
      })
  })
}
