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

const clientId = process.env.CLIENT_ID; //ADD YOUR OWN CLIENT ID to your .env file
const clientSecret = process.env.CLIENT_SECRET; //ADD YOUR OWN CLIENT SECRET
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
  const state = generateRandomString(16); //need to generate random state string for security

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
  const code = req.query.code || null; //pulling out the authorization code after oauthing
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[stateKey] : null; //if we have cookies, then pull out the value from stateKey property

  //can use Node fetch but axios seems to be a bit more simple and more commonly used with Spotify api
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
      //spent a couple hours with this stupid syntax so dont mess this up!!!!
      //Update clientID and clientSecret with your updated ones and check to see if token is being generated

      /* Token should look like this:
{
  "access_token": "ACCESS TOKEN", <-- your access token
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "REFRESH TOKEN",
  "scope": "playlist-read-private user-modify-playback-state playlist-modify-private playlist-modify-public user-read-playback-state"
}
  */
      Authorization:
        'Basic ' +
        new Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
    },
  })
    .then((response) => {
      console.log('TOKEN: ', response.data);
      if (response.status === 200) {
        const { access_token, token_type } = response.data;
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

//NOTES ON ACCESS TOKEN STORAGE:
/* 
When you receive an access token from an OAuth2 server, you can store it in a secure manner to use it later for authenticating API requests. 
One way to do this is by storing the token in a secure cookie in the browser or in a secure storage system on the server, such as a database or cache. 
The token should be encrypted and signed to ensure its integrity.

In a browser-based application, you can store the token in a cookie with the HttpOnly and Secure flags set. 
The HttpOnly flag prevents the cookie from being accessed by JavaScript, which helps to protect against 
cross-site scripting (XSS) attacks, while the Secure flag ensures that the cookie is only sent over HTTPS.

In a server-side application, you can store the token in a secure storage system, such as a database or cache, 
and associate it with the user who generated it. You can then retrieve the token from the storage system when needed 
and use it to authenticate API requests.

It's important to note that access tokens usually have an expiration time. 
So, you may need to refresh the token periodically to ensure that you have a valid token to use for making API requests. 
The refresh token is usually obtained along with the access token and can be used to obtain a new access token when the old one expires.
*/
