const AWS = require('aws-sdk');

const s3 = new AWS.S3();

const myBucket = 'sov-raw-news-data';
const myKey = 'testKey';

const params = {Bucket: myBucket, Key: myKey, Body: 'Hello!'};

s3.putObject(params, function(err, data) {
  if (err) {

    console.log(err)

  } else {

    console.log("Successfully uploaded data to myBucket/myKey");

  }

});
