const mongoose = require('mongoose');
mongoose.connect('****');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});

const articleSchema = mongoose.Schema({
  context: String,
  title: String,
  desc: String,
  url: String,
  publishedAt: Date,
  publisher: String,
  author: String,
  sentiment: {
    orientation: String,
    score: Number,
    magnitude: Number
  }
});

const Article = mongoose.model('Article', articleSchema);

const silence = new Article({
  context: 'Test',
  title: 'test',
  desc: 'test',
  url: 'test',
  publishedAt: '2018-03-11',
  publisher: 'test',
  author: 'test',
  sentiment: {
    orientation: 'test',
    score: 0,
    magnitude:0
  }
});
console.log(silence.context); // 'Silence'

silence.save(function (err, silence) {
  if (err) return console.error(err);
  console.log('saved', silence)

  db.close()
});
