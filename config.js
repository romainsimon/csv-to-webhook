module.exports = {
  // Webhook url you want to send csv lines to :
  "webhookUrl": "https://superwebhook.com/api/webhook/",
  // Csv file to parse :
  "file": "example.csv",
  // Delimiter for fields (, or ;) :
  "delimiter": ",",
  // Encoding of the csv file : 
  "encoding": "utf8",
  // Is there a quote separator :
  "separator": "\"",
  // Delay in milliseconds between each webhook request :
  "delay": 200
};