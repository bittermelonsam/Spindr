const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const querystring = require('node:querystring');
const crypto = require('crypto');
const axios = require('axios'); //easier library for fetching
const PORT = process.env.PORT || 3000;
const fetch = require('node-fetch');

//this allows you to access .env files to read data
//client ID is stored in .env file for security
require('dotenv').config();

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
/*Will need to include this if using PKCE auth code flow. 
Secret is generated when a dev account on spotify is created
Make sure to remove this after project is done if you care about your spotify security
const clientSecret = 'YOUR_CLIENT_SECRET'; */

const redirectUri = process.env.REDIRECT_URI;

//These define the parameters that the user will provide us access to.
//Additional scopes can be found here: https://developer.spotify.com/documentation/web-api/concepts/scopes
const scopes = [
  'playlist-read-private',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-read-playback-state',
  'user-modify-playback-state',
];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//generate random string to use in state property as recommended by Spotify authorization guidelines
const generateRandomString = (length) => {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
};

const stateKey = 'spotify_auth_state';

//GET request to spotify's authorization page
app.get('/login', (req, res) => {
  //Below is for PKCE, to implement later
  // const codeVerifier = generateRandomString();
  // const codeChallenge = base64UrlEncode(crypto.createHash('sha256').update(codeVerifier).digest());
  const state = generateRandomString(16);

  const authorizationUrl =
    'https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code', //required
      client_id: clientId, //required
      scope: scopes.join(' '), //optional scopes
      redirect_uri: redirectUri, //uri that we set when we requested client id on spotify's create app
      //also for PKCE:
      // code_challenge: codeChallenge,
      // code_challenge_method: 'S256',
      state: state,
    });
  res.cookie(stateKey, state);
  res.redirect(authorizationUrl);
});

// get request on callback page. we set the callback page as redirect uri when we got client id from spotify
app.get('/callback', (req, res) => {
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[stateKey] : null;

  // app.get('/callback', async (req, res) => {
  //   fetch('https://accounts.spotify.com/api/token', {
  //     method: 'POST',
  //     headers: {
  //       Authorization: `Basic ${new Buffer.from(
  //         `${clientId}:${clientSecret}}`
  //       ).toString('base64')}`,
  //       'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
  //     },
  //     body: new URLSearchParams({
  //       grant_type: 'client_credentials',
  //       code: req.query.code,
  //       redirect_uri: redirectUri,
  //     }),
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       if (data) {
  //         res.cookie('accessToken', data.access_token);
  //         // res.status(200).redirect('http://localhost:3000/');
  //       }
  //     });
  // });

  axios({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    data: querystring.stringify({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
    }),
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      //a buffer is a temporary storage area in memory that is used to hold data while it is being transferred from one place to another.
      //a buffer object is a specific implementation of a buffer that is commonly used in programming to represent and manipulate binary data.
      Authorization:
        'Basic ' +
        new Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
    },

    // json: true,
  })
    .then((response) => {
      console.log('STATUS CODE: ', response.staus);
      if (response.status === 200) {
        //response using <pre> will display data received from spotify without linebreaks, whitespace
        //axios stores data returned by requests in the data property of the response obj
        res.send(`<pre>${JSON.stringify(response.data, null, 2)}</pre>`);
      } else {
        //if not 200 response, server will give back what spotify is serving
        res.send(response);
      }
    })
    .catch((error) => {
      res.send(error);
    });
});

// app.get('/callback', async (req, res) => {
//   const code = req.query.code || null;
//   const state = req.query.state || null;
//   const storedState = req.cookies ? req.cookies[stateKey] : null;

//   if (state === null || state !== storedState) {
//     res.redirect('/#' +
//       querystring.stringify({
//         error: 'state_mismatch'
//       }));
//   } else {
//     res.clearCookie(stateKey);
//     const codeVerifier = req.cookies.codeVerifier;
//     const tokenParams = {
//       grant_type: 'authorization_code',
//       code: code,
//       redirect_uri: redirectUri,
//       code_verifier: codeVerifier,
//       client_id: clientId,
//       client_secret: clientSecret
//     };
//     const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded'
//       },
//       body: new URLSearchParams(tokenParams)
//     });
//     const tokenData = await tokenResponse.json();
//     const accessToken = tokenData.access_token;
//     const refreshToken = tokenData.refresh_token;
//     // Use the access token to make requests to the Spotify Web API
//   }
// });

//TODO:
//CONNECT TO THE DATABASE

app.get('/test', (req, res) => {
  // console.log('bobo');
  res.status(200).json('is this wog?');
});

app.post('/test', (req, res) => {
  res.status(201).send('WOOOOO THIS IS YOUR DATA');
});

app.get('/', (req, res) => {
  res.send('this will be populated by the goated frontend team (Wes and Tay)');
});

app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`));
