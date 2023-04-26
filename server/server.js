const express = require('express');
const app = express();
const path = require('path');
const querystring = require('node:querystring');
const crypto = require('crypto');
const axios = require('axios'); 
const cors = require('cors');
//this allows you to access .env files to read data
require('dotenv').config();
const PORT = process.env.PORT || 3000;

//had trouble finding the docs from spotify but found this and seems to work: https://github.com/thelinmichael/spotify-web-api-node
// apparently this will allow us to make a spotify object with a method that sets the access token
const spotifyApi = require('spotify-web-api-node');
const cookieParser = require('cookie-parser');
const SpotifyWebApi = require('spotify-web-api-node');

const clientId = process.env.CLIENT_ID; //ADD YOUR OWN CLIENT ID to your .env file
const clientSecret = process.env.CLIENT_SECRET; //ADD YOUR OWN CLIENT SECRET
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

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// function to handle CORS errors
// check to see if this works
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

//generate random string to use in state property as recommended by Spotify authorization guidelines
const generateRandomString = (length) => {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
};

const stateKey = 'spotify_auth_state';

//GET request to spotify's authorization page (oAuth function)
app.get('/login', (req, res) => {
  
  const state = generateRandomString(16); //need to generate random state string for security

  const authorizationUrl =
    'https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code', //required
      client_id: clientId, //required
      scope: scopes.join(' '), //optional scopes
      redirect_uri: redirectUri, //uri that we set when we requested client id on spotify's create app
      state: state,
    });
  res.cookie(stateKey, state);
  res.redirect(authorizationUrl);
});

// get request on callback page on successful oAuth connection. we set the callback page as redirect uri when we got client id from spotify

// look into destructuring user info from response.data
app.get('/callback', (req, res) => {
  const code = req.query.code || null; //pulling out the authorization code after oauthing
  const state = req.query.state || null;
  //if we have cookies, then pull out the value from stateKey property
  const storedState = req.cookies ? req.cookies[stateKey] : null; 
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
    Authorization:
      'Basic ' + new Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
    },
  })
    .then((response) => {
      // console.log('TOKEN: ', response.data);
      if (response.status === 200) {
        //we destructure the response.data which contains our token data
        const { access_token, token_type, refresh_token } = response.data;
        
        // add function setCookie to make this more DRY
        res.cookie('access_token', access_token, {
          maxAge: 3600000, //cookie will expire in an hour
        });

        //this doesn't feel very DRY..
        res.cookie('token_type', token_type, {
          maxAge: 3600000, //cookie will expire in an hour
        });

        res.cookie('refresh_token', refresh_token, {
          maxAge: 3600000, //cookie will expire in an hour
        });

        res.redirect('http://localhost:8080');

      } else {
        //if not 200 response, server will give back what spotify is serving
        res.send(response);
      }
    })
    .catch((error) => {
      res.send(error);
    });
});


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../src/index.html'));
});

// function that grabs song recs from Spotify and pushes them into an array
// look into removing this from backend as it's being called on the frontend

app.post('/getSongRecs', (req, res) => {
  // res.set('Access-Control-Allow-Origin', '*');
  const { genres } = req.body;
  //if access token exists in req cookie then assign it, otherwise set it to null
  const access_token = req.cookies ? req.cookies['access_token'] : null;

  //check to see if token exists
  if (!access_token) {
    return res.send('NO TOKENS HERE, TRY AGAIN LOSER.');
  }

  const spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(access_token);

  spotifyApi
    .getRecommendations({
      seed_genres: 'pop,chill',
      max_popularity: 60,
    })
    .then((data) => {
      const recs = data.body;

      let trackDetails = []; //array to store all 20 found uris of tracks from api call

      recs.tracks.forEach((track) => {
        //only store tracks that have preview URLs
        if (track.preview_url !== null) {
          trackDetails.push({
            trackName: track.name,
            artistName: track.artists[0].name,
            albumImg: track.album.images[0], //get the largest size of album img for track, obj contains url and height/width
            trackUri: track.uri,
            previewUrl: track.preview_url,
          });
        }
      });

      const recTracks = {
        tracks: recs.tracks, //full object just in case react app needs it
        trackDetails, //obj containing most necessary details for react app
      };
      
      res.json(recTracks);
      
    })
    .catch((error) => {
      console.error('THIS IS THE ERROR: ', error);
    });
});

app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`));

//TODO:
//CONNECT TO THE DATABASE TO STORE ACCESS TOKEN INFO ON USER AS WELL AS OTHER DATA LIKE PREVIOUS SONG SELECTIONS AND RECS

/* DELETE...NO LONGER NEEDED....

//THIS IS JUST A TEST ENDPOINT TO SEE IF CODE WORKS FOR fetch.js
//delete this later since frontend handling fetch requests is cleaner, no need to use server as middleware to fetch spotify data
app.get('/getRecs', async (req, res) => {
    // const [cookies] = useCookies(['access_token']);
    // const token = cookies.get('access_token');
    // const tokenType = cookies.get('token_type');
    const token = req.cookies ? req.cookies['access_token'] : null;
    const tokenType = req.cookies ? req.cookies['token_type'] : null;

    const params = {
        limit: 50,
        seed_genres: "pop,chill,dance,rnb", //genres up to 5, need to be a string, comma-separated. ex: "pop,edm,chill"
        max_popularity: 40, //hardcoded for now? maybe let UI handle an input field for popularity too
    }
    axios.defaults.headers.common['Authorization'] = `${tokenType} ${token}`;

    try { 
        const response = await axios.get('https://api.spotify.com/v1/recommendations', {params});

        let trackDetails = []; //array to store all 20 found uris of tracks from api call

        response.data.tracks.forEach((track) => {
          //only store tracks that have preview URLs
          if (track.preview_url !== null) {
            trackDetails.push({
                trackName: track.name,
                artistName: track.artists[0].name, 
                albumImg: track.album.images[0], //get the largest size of album img for track, obj contains url and height/width
                trackUri: track.uri,
                previewUrl: track.preview_url, 
            });
          }
        });

        // obj contains:
        // - array of objects: all tracks and their details queried from recommendations endpoint
        // - array of objects: track name, artist name, album art, track URI, preview URL

        const recTracks = {
          tracks: response.data.tracks, //full object just in case react app needs it
          trackDetails, //obj containing most necessary details for react app
      }
      console.log(recTracks);
      return recTracks;

  } catch (err) { 
      console.log(err);
  }
})

app.get('/createPlaylist', (req, res) => {
  //if access token exists in req cookie then assign it, otherwise set it to null
  const access_token = req.cookies ? req.cookies['access_token'] : null;

  //check to see if token exists
  if (!access_token) {
    return res.send('NO TOKENS HERE, TRY AGAIN LOSER.');
  }

  const spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(access_token);

  spotifyApi
    .createPlaylist('THIS IS A PLAYLIST GENERATED BY MY APPLICATION HOW COOL', {
      public: false,
    })
    .then((data) => {
      console.log('created a playlist boiiiiii');
      console.log(data.body);
      res.send('PLAYLIST CREATE COMPLETE. WOO.');
    })
    .catch((error) => {
      console.error("didn't work :( :", error);
      res.send('ERROR, NO PLAYLIST');
    });
});

app.get('/test', (req, res) => {
  // console.log('bobo');
  res.status(200).json('is this wog?');
});

app.post('/test', (req, res) => {
  res.status(201).send('WOOOOO THIS IS YOUR DATA');
});




*/

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

//THIS IS JUST A TEST ENDPOINT TO SEE IF CODE WORKS FOR fetch.js
//delete this later since frontend handling fetch requests is cleaner, no need to use server as middleware to fetch spotify data
// app.post('/getRecs', async (req, res) => {
//   //axios.post("/getRecs", {genres: "pop"})
//   const { genres } = req.body;
//   // const [cookies] = useCookies(['access_token']);
//   // const token = cookies.get('access_token');
//   // const tokenType = cookies.get('token_type');
//   const token = req.cookies ? req.cookies['access_token'] : null;
//   const tokenType = req.cookies ? req.cookies['token_type'] : null;

//   const params = {
//     limit: 50,
//     seed_genres: 'pop', //genres up to 5, need to be a string, comma-separated. ex: "pop,edm,chill"
//     max_popularity: 40, //hardcoded for now? maybe let UI handle an input field for popularity too
//   };
//   axios.defaults.headers.common['Authorization'] = `${tokenType} ${token}`;

//   try {
//     const response = await axios.get(
//       'https://api.spotify.com/v1/recommendations',
//       { params }
//     );

//     let trackDetails = []; //array to store all 20 found uris of tracks from api call

//     response.data.tracks.forEach((track) => {
//       //only store tracks that have preview URLs
//       if (track.preview_url !== null) {
//         trackDetails.push({
//           trackName: track.name,
//           artistName: track.artists[0].name,
//           albumImg: track.album.images[0], //get the largest size of album img for track, obj contains url and height/width
//           trackUri: track.uri,
//           previewUrl: track.preview_url,
//         });
//       }
//     });

//     // obj contains:
//     // - array of objects: all tracks and their details queried from recommendations endpoint
//     // - array of objects: track name, artist name, album art, track URI, preview URL

//     const recTracks = {
//       tracks: response.data.tracks, //full object just in case react app needs it
//       trackDetails, //obj containing most necessary details for react app
//     };
//     console.log(recTracks);
//     return res.json(recTracks);
//   } catch (err) {
//     console.log(err);
//   }
// });
