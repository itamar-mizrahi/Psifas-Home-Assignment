const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const EMAIL = "theitamarmizrahi@gmail.com";
// const BEARER_TOKEN = "7a4894f0e779"; for dev env only
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
    console.error(error, "line 35");
    return null;
  }
}

app.post("/statistics", async (req, res) => {
  const token = await getToken(EMAIL);
  if (!token) {
    return res.status(400).json({ message: "Failed to obtain bearer token" });
  }
  let offset = 0;
  let records = [];
  let medicalRecords = await fetchMedicalRecords(token, offset);
  while (medicalRecords && medicalRecords.offset) {
    records = records.concat(medicalRecords);
    offset += 1;
    medicalRecords = await fetchMedicalRecords(token, offset);
  }
  return res.status(200).json({ phenotypeCounts: offset });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
