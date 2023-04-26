const { a } = require('@react-spring/web');
const axios = require('axios');
const crypto = require('crypto');
const querystring = require('node:querystring');

const controller = {}

require('dotenv').config();

const spotifyApi = require('spotify-web-api-node'); // apparently this will allow us to make a spotify object with a method that sets the access token
const cookieParser = require('cookie-parser');
const SpotifyWebApi = require('spotify-web-api-node');

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

//generate random string to use in state property as recommended by Spotify authorization guidelines
const generateRandomString = (length) => {
    return crypto
      .randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length);
  };

const stateKey = 'spotify_auth_state';

controller.login = (req, res, next) => {
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
    res.locals.authorizationUrl = authorizationUrl;
    return next();
}

controller.callback = (req, res, next) => {
    const code = req.query.code || null; //pulling out the authorization code after oauthing
    const state = req.query.state || null;

    //note to jessica: we added this earlier. too tired to understand if it actually plays a more important part now that we are using cookies
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

        /* Token obj should look like this:
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
        // console.log('TOKEN: ', response.data);
        res.locals.response = response;
        if (response.status === 200) {
            //we destructure the response.data which contains our token data
            const { access_token, token_type, refresh_token } = response.data;

            //note to jessica: im able to get the access token cookie to generate but not the other 2 for some reason
            //nvm, access token is a response cookie, apparently type and refresh tokens are on the req cookie
            res.cookie('access_token', access_token, {
            // httpOnly: true,
            // secure: true, //only transmit cookies over HTTPS
            maxAge: 3600000, //cookie will expire in an hour
            });

            //this doesn't feel very DRY..
            res.cookie('token_type', token_type, {
            // httpOnly: true,
            // secure: true, //only transmit cookies over HTTPS
            maxAge: 3600000, //cookie will expire in an hour
            });

            res.cookie('refresh_token', refresh_token, {
            // httpOnly: true,
            // secure: true, //only transmit cookies over HTTPS
            maxAge: 3600000, //cookie will expire in an hour
            });

            res.redirect('http://localhost:8080');
        } else {
            //if not 200 response, server will give back what spotify is serving
            return next();
        }
        })
        .catch((error) => {
            res.send(error);
        });
}

controller.getSongRecs = (req, res, next) => {
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
      seed_genres: 'pop,chill', //take user input
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
      res.locals.recTracks = recTracks;
      return next();
    })
    .catch((error) => {
      console.error('THIS IS THE ERROR: ', error);
    });
}

controller.createPlaylist = (req, res, next) => {
    console.log('request received, checking token');
    //if access token exists in req cookie then assign it, otherwise set it to null
    const access_token = req.cookies ? req.cookies['access_token'] : null;
    
    //check to see if token exists
    if (!access_token) {
      return res.send('NO TOKENS HERE, TRY AGAIN LOSER.');
    }

    res.locals.access_token = access_token;
  
    const spotifyApi = new SpotifyWebApi();
    spotifyApi.setAccessToken(access_token);
  
    console.log('token accepted, creating playlist');
    
    spotifyApi
      .createPlaylist('THIS IS A PLAYLIST GENERATED BY MY APPLICATION HOW COOL', {
        public: false,
      })
      .then((data) => {
        console.log('created a playlist boiiiiii');
        // console.log(data.body);
        const { id } = data.body
        res.locals.playlist_id = id;
        // res.send('PLAYLIST CREATE COMPLETE. WOO.');
        return next();
      })
      .catch((error) => {
        console.error("didn't work :( :", error);
        // res.send('ERROR, NO PLAYLIST');
    });
}

controller.addTracksToPlaylist = (req, res, next) => {
    console.log('adding tracks to playlist')
    console.log("playlist ID ", res.locals.playlist_id);

    const spotifyApi = new SpotifyWebApi();
    spotifyApi.setAccessToken(res.locals.access_token);
  
    console.log('token accepted, creating playlist');

    spotifyApi
        .addTracksToPlaylist(res.locals.playlist_id, ["spotify:track:4iV5W9uYEdYUVa79Axb7Rh", "spotify:track:1301WleyT98MSxVHPZCA6M"])
        .then((response) => {
            console.log('sucessfully added songs');
            return next();
        })
        .catch((err) => {
            console.log(err);
            return next(err);
        })
}


module.exports = controller;