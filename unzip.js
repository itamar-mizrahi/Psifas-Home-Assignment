const unzipper = require("unzipper");
const fs = require("fs");
const axios = require("axios");
const csv = require("csv-parser");

async function extractCsv(url) {
  try {
    const response = await axios({
      method: "get",
      url: url,
      responseType: "stream",
    });

    response.data.pipe(unzipper.Parse()).on("entry", (entry) => {
      const fileName = entry.path;
      const type = entry.type;

      if (type === "File" && fileName.endsWith(".csv")) {
        entry.pipe(fs.createWriteStream(fileName));
      } else {
        entry.autodrain();
      }
    });
  } catch (err) {
    console.error(err);
  }
}

async function getObjectFromCSV(nameOfFile) {
  const results = [];

  fs.createReadStream(`${nameOfFile}.csv`)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      console.log(await results);
    });
  console.log(results);
  // return results
}

async function extractData(nameOfFile) {
  const results = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(`${nameOfFile}.csv`)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        resolve(results);
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

async function getObjectFromCSV(nameOfFile) {
  const data = await extractData(nameOfFile);
  let arrayOfPhenotypesFromData = await data.map((data) => {
    return data["קוד הבחנה"];
  });
  return arrayOfPhenotypesFromData;
}

module.exports = { extractCsv, getObjectFromCSV };
