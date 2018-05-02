import AWS = require("aws-sdk");
import es = require("elasticsearch");
import awsES = require("http-aws-es");
import env = require("dotenv");

env.config();

AWS.config.region = "us-east-1";

const client = new es.Client({
  hosts: [process.env.ES_URL],
  connectionClass: awsES
});

client.indices
  .delete({ index: process.env.ES_INDEX })
  .then(() => console.log("index deleted"))
  .catch(err => console.error(err));
