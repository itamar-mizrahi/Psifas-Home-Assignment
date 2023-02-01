const unzipper = require('unzipper');
const fs = require('fs');
const  axios = require('axios');

async function extractCsv(url) {
  try {
    // Download the zip file
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream'
    });

    // Extract the contents of the zip file
    response.data
      .pipe(unzipper.Parse())
      .on('entry', entry => {
        const fileName = entry.path;
        const type = entry.type; // 'Directory' or 'File'

        if (type === 'File' && fileName.endsWith('.csv')) {
          entry.pipe(fs.createWriteStream(fileName));
        } else {
          entry.autodrain();
        }
      });
  } catch (err) {
    console.error(err);
  }
}

module.exports={extractCsv}