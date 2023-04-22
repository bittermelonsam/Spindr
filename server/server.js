const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//TODO:
//CONNECT TO THE DATABASE

app.get('/test', (req, res) => {
  console.log('bobo');
  res.status(200).json('is this wog?');
});

app.post('/test', (req, res) => {
  res.status(201).send('WOOOOO THIS IS YOUR DATA');
});

app.get('/', (req, res) => {
  res.send('hello world!');
});

app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`));
