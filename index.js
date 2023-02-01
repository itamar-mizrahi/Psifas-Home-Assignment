const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const { extractCsv, getObjectFromCSV } = require("./unzip.js");
const app = express();
app.use(bodyParser.json());

const EMAIL = "theitamarmizrahi@gmail.com";
const BEARER_TOKEN = "7a4894f0e779"; //for dev env only
const BASE_URL = "https://8rzh7g1f55.execute-api.eu-west-1.amazonaws.com/v1/";

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

app.post("/statistics", async (req, res) => {
  const token = await getToken(EMAIL);
  const data = req.body;

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
  //   let records = [];
  let medicalRecords = await fetchMedicalRecords(token, offset);
  while (medicalRecords.offset) {
    // records = records.concat(medicalRecords);
    getObjectFromCSV(`health_records_${offset}`)
    // console.log(medicalRecords.url);
    extractCsv(medicalRecords.url);
    offset += 1;
    medicalRecords = await fetchMedicalRecords(token, offset);
  }
  return res.status(200).json({ phenotypeCounts: offset });
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
