// Initially load the data from the last 6h
window.addEventListener('load', function() {
  loadData('6h')
})

// TODO change to env data
const dynamodb = new AWS.DynamoDB({
  region: 'us-east-1',
  accessKeyId: 'AKIAJ3BZBQHWBFIJ6XFA',
  secretAccessKey: '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',
});

let timeframeData = []
let posArticles = []
let neutArticles = []
let negArticles = []
let lastSelectedDate = document.getElementById('6h')
let lastSelectedBar

function showSentimentTopArticles(sentiment) {
  const currSelected = document.getElementById(`${sentiment}Bar`)
  let sentimentList = getTopArticlesForSentiment(sentiment)

  if (currSelected.classList.contains('selected-bar')) {
    sentimentList = []
    currSelected.classList.toggle('selected-bar')
  } else {
    currSelected.classList.toggle('selected-bar')
    if (lastSelectedBar && lastSelectedBar !== currSelected) {
      lastSelectedBar.classList.remove('selected-bar')
    }
  }

  lastSelectedBar = currSelected

  updateExampleTable(sentimentList)
}

function getTopArticlesForSentiment(sentiment) {
  switch (sentiment) {
    case 'positive':
      return posArticles.slice(0, 5)
    case 'neutral':
      return neutArticles.slice(0, 5)
    case 'negative':
      return negArticles.slice(0, 5)
  }
}

function updateExampleTable(articleList) {
  document.getElementById('example-table')
    .innerHTML = articleList.map(article => {
    const title = article.title.S
    const url = article.url.S
    const source = article.source.M.name.S
    const publishedAt = article.publishedAt.S

    return `<tr>
                <td><a href="${url}" style="color:${getSentimentColor(getSelectedSentiment())}">${title}</a></td>
                <td>${source}</td>  
                <td>${moment(publishedAt).format('MM-DD-YYYY HH:mm')}</td>  
              </tr>
              `
  }).join('')
}

function queryDynamoDB(fromTS, untilTS) {
  return new Promise((res, rej) => {
    const params = {
      TableName: "sov-article-data", // TODO change to env var
      ExpressionAttributeValues: {
        ":t1": {
          S: fromTS.format('YYYY-MM-DDTHH:mm:ss')
        },
        ":t2": {
          S: untilTS.format('YYYY-MM-DDTHH:mm:ss')
        }
      },
      FilterExpression: "publishedAt BETWEEN :t1 AND :t2"
    }

    dynamodb.scan(params, (err, data) => {
      if (err) {
        rej(err)
        return
      }

      res(data)
    });
  })
}

function loadData (timespan) {
  const currSelectedDate = document.getElementById(timespan)
  const untilTS = moment()
  const fromTS = getFromTS(timespan)

  lastSelectedDate.classList.toggle('selectedDate')
  currSelectedDate.classList.toggle('selectedDate')
  lastSelectedDate = currSelectedDate

  queryDynamoDB(fromTS, untilTS)
    .then(articles => {
      // Map articles to their subarrays like posArticles
      updateArticles(articles.Items)

      if (lastSelectedBar) {
        updateExampleTable(
          getTopArticlesForSentiment(
            getSelectedSentiment()))
      }

      // Updating the width and text of each bar
      updateBars()
    })
    .catch(err => console.log(err))
}

function updateArticles(articles) {
  timeframeData = articles

  const tmpPos = []
  const tmpNeut = []
  const tmpNeg = []

  timeframeData.forEach(article => {
    const sentiment = article.sentiment.S

    switch (sentiment) {
      case 'POSITIVE':
        tmpPos.push(article)
        break
      case 'NEUTRAL':
        tmpNeut.push(article)
        break
      case 'NEGATIVE':
        tmpNeg.push(article)
        break
    }
  })

  // TODO rank the articles


  posArticles = tmpPos
  neutArticles = tmpNeut
  negArticles = tmpNeg
}

function getSelectedSentiment() {
  const currSelectedSentiment = lastSelectedBar.id

  switch (currSelectedSentiment) {
    case 'positiveBar':
      return 'positive'
    case 'neutralBar':
      return 'neutral'
    case 'negativeBar':
      return 'negative'
  }
}

function getSentimentColor(sentiment) {
  switch (sentiment) {
    case 'positive':
      return '#b6ed8f'
    case 'neutral':
      return '#b8c4bb'
    case 'negative':
      return '#ed636e'
  }
}

function getFromTS(timespan) {
  let fromTS = moment()

  switch (timespan) {
    case '6h':
      fromTS.subtract(6, 'hour')
      break
    case '1d':
      fromTS.subtract(1, 'day')
      break
    case '3d':
      fromTS.subtract(3, 'day')
      break
    case '1w':
      fromTS.subtract(1, 'week')
      break
    case '1m':
      fromTS.subtract(1, 'month')
      break
    case '6m':
      fromTS.subtract(6, 'month')
      break
    case '1y':
      fromTS.subtract(1, 'year')
      break
  }

  return fromTS
}

function updateBars() {
  const posBar = document.getElementById('positiveBar')
  const neutBar = document.getElementById('neutralBar')
  const negBar = document.getElementById('negativeBar')

  const posBarWidth = Math.round(100 / timeframeData.length * posArticles.length)
  const neutBarWidth = Math.round(100 / timeframeData.length * neutArticles.length)
  const negBarWidth = Math.round(100 / timeframeData.length * negArticles.length)

  posBar.style.width = `${posBarWidth}%`
  neutBar.style.width = `${neutBarWidth}%`
  negBar.style.width = `${negBarWidth}%`

  posBar.innerHTML = `${posBarWidth}%`
  neutBar.innerHTML = `${neutBarWidth}%`
  negBar.innerHTML = `${negBarWidth}%`
}
