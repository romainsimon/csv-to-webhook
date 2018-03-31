const {
  webhookUrl,
  file,
  delimiter,
  encoding,
  separator,
  delay
} = require('./config.js');

const fs = require('fs');
const csvParse = require('csv-parse');
const request = require('request');
const colors = require('colors');

let result = {
  success: 0,
  failed: 0
};

function start() {
  fs.readFile('./' + file, encoding, (err, data) => {
    if (err) throw err;
    parseCsv(data).then((lines) => {
      sendToWebhook(lines, 0);
    }).catch((e) => {
      console.log(e);
    });
  });
}

function parseCsv(content) {
  // Define mapping of columns
  const headline = content.split('\n')[0];
  const sepReg = new RegExp(separator, 'g');
  const columns = headline.split(delimiter).map((column) => {
    return column.replace(sepReg, '').trim();
  });

  // Configure csv parser
  const parser = csvParse({
    delimiter: delimiter || ',',
    columns,
    quote: separator || false,
    from: 2, // To avoid the first line containing the headers
    skip_empty_lines: true,
    skip_lines_with_empty_values: true,
    relax_column_count: true
  });

  return new Promise((resolve, reject) => {

    const lines = [];

    parser.on('readable', () => {
      let record;
      while ((record = parser.read()) != null) {
        console.log()
        lines.push(record);
      }
    });

    parser.on('error', (err) => {
      return reject(err);
    });

    parser.on('finish', () => {
      return resolve(lines);
    });

    parser.write(content);
    parser.end();
  })
  .then(lines => {
    return lines;
  });
}

function sendToWebhook(lines, i) {

  const line = lines[i];

  console.log(i + 1 + '/' + lines.length + ' ==> Sending to webhook ' + webhookUrl + ' : ')
  console.log(colors.yellow('    ' + JSON.stringify(line)));

  const data = {
    url: webhookUrl,
    form: line
  };

  request.post(data, (error, response, body) => {
    if (error) console.log(colors.red(error));
    if (response && response.statusCode === 200) {
      console.log(colors.green(response.statusCode + ' OK'));
      result.success++;
    } else {
      if (response) console.log(colors.red(response.statusCode + response));
      result.failed++;
    }
    j = i+1;
    if (j < lines.length) {
      setTimeout(() => sendToWebhook(lines, j), delay);
    } else {
      if (lines.length === result.success) {
        console.log(colors.green('--------------------------------------'));
        console.log(colors.green(' ALL LINES SENT WITH SUCCESS TO WEBHOOK'));
        console.log(colors.green('--------------------------------------'));
      } else {
        console.log('--------------------------------------');
        console.log(colors.green('- SUCCESS : ' + result.success));
        console.log(colors.red('- FAILED : ' + result.failed));
        console.log('--------------------------------------');
      }
    }
  });
}

start();