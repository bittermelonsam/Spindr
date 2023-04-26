const express = require('express');
const app = express();
const path = require('path');

const controller = require('./controller')

//this allows you to access .env files to read data
require('dotenv').config();

const PORT = process.env.PORT || 3000;

//had trouble finding the docs from spotify but found this and seems to work: https://github.com/thelinmichael/spotify-web-api-node
const cookieParser = require('cookie-parser');
app.use(cookieParser());
// app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.header('Access-Control-Allow-Credentials', true);
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

//GET request to spotify's authorization page
app.get('/login', controller.login, (req, res) => {
  res.redirect(res.locals.authorizationUrl);
});

// get request on callback page. we set the callback page as redirect uri when we got client id from spotify
app.get('/callback', controller.callback, (req, res) => {
  res.status(200).send(res.locals.response);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../src/index.html'));
});

app.post('/getSongRecs', controller.getSongRecs, (req, res) => {
    res.status(200).json(res.locals.recTracks)
});

//for createPlaylist
  //req.body must include array of songIDs to add to playlist, currently hard coded
app.post('/createPlaylist', controller.createPlaylist, controller.addTracksToPlaylist, (req, res) => {
  res.status(200).send('added tracks!');
});

//global error handler
app.use((err, req, res, next) => {
  const defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { err: 'An error occurred' },
  };
  const errorObj = Object.assign({}, defaultErr, err);
  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
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
