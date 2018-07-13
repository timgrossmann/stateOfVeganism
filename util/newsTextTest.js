const schedule = require('node-schedule')
const NewsAPI = require('newsapi')
const newsapi = new NewsAPI('****')
const request = require('request-promise-native')

const textract = require('textract')
const textConfig = { preserveLineBreaks: true }

// TODO improve regex
const pattern = /(?:(?:.*[.!?\|])|^)(.*?vegan.*?[.!?\|])/ig

//schedule.scheduleJob('0 */2 * * *', function(){
newsapi.v2.everything({
  q: '+vegan',
  pageSize: 100,
  sortBy: 'popularity',
  from: '2018-05-01T14:00:00',
  to: '2018-05-01T15:00:00'
}).then(response => {
  console.log(response.totalResults);

  /*
  response.articles.forEach(article => {
    //console.log(JSON.stringify(article, null, 2)

    textract.fromUrl(article.url, textConfig, ( err, page ) => {
      if (err) {
        console.log(err)
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

      const context = `
        ${article.title.indexOf('vegan') > -1 ? article.title : ''}
        ${article.description.indexOf('vegan') > -1 ? article.description : ''}
        ${texts}
        `.trim()

      //console.log(article.title)
      //console.log(context, '\n')

      const doc = {
        context: context,
        title: article.title,
        desc: article.description,
        url: article.url,
        publishedAt: article.publishedAt,
        publisher: article.source.name,
        author: article.author
      }

      // TODO write to DB
    })
  })

  */
})
//})




