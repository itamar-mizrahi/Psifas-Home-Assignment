const express = require("express");
const axios = require("axios");
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

const BASE_URL = "https://8rzh7g1f55.execute-api.eu-west-1.amazonaws.com/v1";

app.get("/token", async (req, res) => {
  try {
    const email = req.query.email;
    const response = await axios.get(`${BASE_URL}/token?email=${email}`);
    res.send(response.data);
  } catch (error) {
    console.log(error,res);
    res.status(500).send({ error: error.message });
  }
});

app.get("/patients_data_address", async (req, res) => {
  try {
    const offset = req.query.offset;
    const response = await axios.get(`${BASE_URL}/patients_data_address?offset=${offset}`);
    res.send(response.data);
  } catch (error) {
    console.log(error,res);
    res.status(500).send({ error: error.message });
  }
});

app.post("/statistics", async (req, res) => {
  try {
    const statistics = req.body;
    await axios.post(`${BASE_URL}/statistics`, statistics);
    res.send({ message: "Statistics sent successfully" });
  } catch (error) {
    console.log(error,res);
    res.status(500).send({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});