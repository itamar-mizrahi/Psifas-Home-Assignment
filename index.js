const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const EMAIL="theitamarmizrahi@gmail.com";
const BEARER_TOKEN="7a4894f0e779";
const BASE_URL = "https://8rzh7g1f55.execute-api.eu-west-1.amazonaws.com/v1/";

// Function to obtain the bearer token
async function getToken(email) {
  try {
    // console.log(email);
    const response = await axios.get(`${BASE_URL}token?email=${email}`);
    // console.log(response.data.bearer_token);
    return response.data.bearer_token;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Function to fetch the medical records
async function fetchMedicalRecords(token, offset) {
  try {
    const response = await axios.get(`${BASE_URL}patients_data_address?offset=${offset}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    // console.log(response.data.offset);
    return response.data;
  } catch (error) {
    console.error(error ,'line 35');
    return null;
  }
}



// Route to handle the analysis of medical records
app.post('/statistics', async (req, res) => {
//   const email = req.body.email;
  const token = await getToken(EMAIL);
//   console.log(token);
  if (!token) {
    return res.status(400).json({ message: 'Failed to obtain bearer token' });
  }
  let offset = 0;
  let records = [];
  let medicalRecords = await fetchMedicalRecords(token, offset);
  while (medicalRecords && medicalRecords.offset) {
    //   console.log(medicalRecords.offset);
    records = records.concat(medicalRecords);
    // console.log(records);
    offset += 1;
    medicalRecords = await fetchMedicalRecords(token, offset);
  }
//   const phenotypeCounts = countPhenotypes(records);
//   console.log(phenotypeCounts);
  return res.status(200).json({phenotypeCounts:offset});
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));

// const express = require("express");
// const axios = require("axios");
// const bodyParser = require('body-parser');

// const app = express();

// app.use(bodyParser.json());
// const EMAIL="theitamarmizrahi@gmail.com"
// const BEARER_TOKEN="7a4894f0e779"
// const BASE_URL = "https://8rzh7g1f55.execute-api.eu-west-1.amazonaws.com/v1";

// app.get("/token", async (req, res) => {
//   try {
//     const email = req.query.email;
//     const response = await axios.get(`${BASE_URL}/token?email=${email}`);
//     res.send(response.data);
//     console.log(response);
//   } catch (error) {
//     console.log(error,res);
//     res.status(500).send({ error: error.message });
//   }
// });

// app.get("/patients_data_address", async (req, res) => {
//   try {
//     const offset = req.query.offset;
//     const response = await axios.get(`${BASE_URL}/patients_data_address?offset=${offset}`);
//     res.send(response.data);
//   } catch (error) {
//     console.log(error,res);
//     res.status(500).send({ error: error.message });
//   }
// });

// app.post("/statistics", async (req, res) => {
//   try {
//     const statistics = req.body;
//     await axios.post(`${BASE_URL}/statistics`, statistics);
//     res.send({ message: "Statistics sent successfully" });
//   } catch (error) {
//     console.log(error,res);
//     res.status(500).send({ error: error.message });
//   }
// });

// app.listen(3000, () => {
//   console.log("Server listening on port 3000");
// });

// Function to count the occurrences of each phenotype
// function countPhenotypes(records) {
//   const phenotypeCounts = {};
//   records.forEach(record => {
//     console.log(record.phenotype);
//     const phenotype = record.phenotype;
//     // console.log(record);
//     // console.log(phenotype);
//     if (!phenotypeCounts[phenotype]) {
//       phenotypeCounts[phenotype] = 1;
//     } else {
//       phenotypeCounts[phenotype] += 1;
//     }
//   });
//   return phenotypeCounts;
// }