const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const { extractCsv, getObjectFromCSV } = require("./unzip.js");
const app = express();
app.use(bodyParser.json());

const EMAIL = "theitamarmizrahi@gmail.com"; //*for dev env only
const BEARER_TOKEN = "7a4894f0e779"; //*for dev env only
const BASE_URL = "https://8rzh7g1f55.execute-api.eu-west-1.amazonaws.com/v1/";//*for dev env only TODO:create prod env

async function getToken(email) {
  try {
    const response = await axios.get(`${BASE_URL}token?email=${email}`);
    return response.data.bearer_token;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function fetchMedicalRecords(token, offset) {
  try {
    const response = await axios.get(
      `${BASE_URL}patients_data_address?offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

function getAmountOfPhenotypesInData(
  arrayOfPhenotypesFromData,
  arrayOfPhenotypesFromBody
) {
  let counter = 0;
  for (let i in arrayOfPhenotypesFromBody) {
    for (let j in arrayOfPhenotypesFromData) {
      if (arrayOfPhenotypesFromBody[i] == arrayOfPhenotypesFromData[j]) {
        counter++;
        console.log("found " + arrayOfPhenotypesFromBody[i] + " in both lists");
      }
    }
  }
  console.log(counter, "line 52");
  return counter;
}

app.post("/statistics", async (req, res) => {
  const token = await getToken(EMAIL);
  const data = req.body;
  const arrayOfPhenotypesFromBody = Object.values(req.body);
  console.log(Object.values(req.body));
  const isICD9 = Object.values(data).every((key) => {
    return /^(V\d{2}(\.\d{1,2})?|\d{3}(\.\d{1,2})?|E\d{3}(\.\d)?)$/.test(key);
  });

  const isICD10 = Object.values(data).every((key) => {
    return /^[A-TV-Z][0-9][A-Z0-9](\.[A-Z0-9]{1,4})?$/.test(key);
  });

  if (!isICD9 && !isICD10) {
    return res
      .status(400)
      .json({ message: "Data is not in ICD9 or ICD10 format" });
  }
  if (!token) {
    return res.status(400).json({ message: "Failed to obtain bearer token" });
  }
  let offset = 0;
  let phenotypeCounts = 0;
  let medicalRecords = await fetchMedicalRecords(token, offset);
  while (medicalRecords.offset) {
    let arrayOfPhenotypesFromData = await getObjectFromCSV(
      `health_records_${offset}`
    );
    let counterPerFile = getAmountOfPhenotypesInData(
      arrayOfPhenotypesFromData,
      arrayOfPhenotypesFromBody
    );
    phenotypeCounts += counterPerFile;
    extractCsv(medicalRecords.url);
    offset += 1;
    medicalRecords = await fetchMedicalRecords(token, offset);
  }
  return res.status(200).json({ phenotypeCounts: phenotypeCounts });
});

app.get("/token", async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/token?email=${EMAIL}`);
    res.send(response.data);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/patients_data_address", async (req, res) => {
  try {
    const offset = req.query.offset;
    const response = await axios.get(
      `${BASE_URL}/patients_data_address?offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
        },
      }
    );
    res.send(response.data);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
