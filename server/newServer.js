const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const authRouter = require('./routes/auth.js');
const authController = require('./controllers/authController.js');

const playlistRouter = require('./routes/playlist.js')
const playlistController = require('./controllers/playlistController.js');

/* CONFIGURATIONS */
const app = express();
const PORT = 3000;

/**
 * handle parsing request body
 */
app.use(cors()); //need this for cors
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ROUTES */
app.use('/auth', authRouter);
app.use('/playlist', playlistRouter);

// catch-all route handler for any requests to an unknown route
app.use((req, res) => res.status(404));

// Global error handler
app.use((err, req, res, next) => {
  const defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 400,
    message: { err: 'An error occurred' },
  };
  const errorObj = Object.assign({}, defaultErr, err);
  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});


/* START SERVER */
app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}...`);
});


module.exports = app;