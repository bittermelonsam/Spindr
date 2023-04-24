import axios from 'axios';
import { useCookies } from 'react-cookie';

//need to export these functions for React app to use
//using axios, they can make fetch requests in React app
//genre takes in a string, comma-separated ex: "country,classical"
export async function getRecommendations(genres) {
  //TO DO: check if the useCookies method actually retrieves cookies within react app
  const [cookies] = useCookies(['access_token']);
  console.log('cookie', cookies);
  const token = cookies['access_token'];
  console.log('TOKEN : ', token);
  const tokenType = cookies['token_type'];

  const params = {
    limit: 30,
    seed_genres: genres, //genres up to 5, need to be a string, comma-separated. ex: "pop,edm,chill"
  };

  //need to set header with token for axios fetch requests
  axios.defaults.headers.common['Authorization'] = `${tokenType} ${token}`;

  try {
    const response = await axios.get(
      'https://api.spotify.com/v1/recommendations',
      { params }
    );

    let trackDetails = []; //array to store all 20 found uris of tracks from api call
    let trackUris = [];

    response.data.tracks.forEach((track) => {
      //only store tracks that have preview URLs
      if (track.preview_url !== null) {
        trackDetails.push({
          trackName: track.name,
          artistName: track.artists.name,
          albumImg: track.album.images[0], //get the largest size of album img for track
          trackUri: track.uri,
          previewUrl: track.preview_url,
        });

        trackUris.push(track.uri);
      }
    });

    /*
        obj contains:
        - array of objects: all tracks and their details queried from recommendations endpoint
        - array of objects: track name, artist name, album art, track URI, preview URL
        - array of strings: track URIs, need to pass into addToPlaylist func
        */
    const recTracks = {
      tracks: response.data.tracks, //full object just in case react app needs it
      trackDetails, //obj containing most necessary details for react app
      trackUris,
    };

    return recTracks;
  } catch (err) {
    console.log(err);
  }
}

//function to get user info
export async function getUser() {
  const [cookies] = useCookies(['access_token']);
  const token = cookies.get('access_token');
  const tokenType = cookies.get('token_type');

  //need to set header with token for axios fetch requests
  axios.defaults.headers.common['Authorization'] = `${tokenType}: ${token}`;

  try {
    const response = await axios.get('https://api.spotify.com/v1/me');

    const { id, display_name, external_urls } = response.data;

    const userData = {
      id,
      display_name,
      spotifyProfileUrl: external_urls.spotify, //url to user's profile
    };

    return userData;
  } catch (err) {
    console.log(err);
  }
}

export async function createPlaylist() {
  const [cookies] = useCookies(['access_token']);
  const token = cookies.get('access_token');
  const tokenType = cookies.get('token_type');

  //need to set header with token for axios fetch requests
  axios.defaults.headers.common['Authorization'] = `${tokenType}: ${token}`;

  try {
    const { id } = await getUser();
    const playlist = await axios.post(
      `https://api.spotify.com/v1/users/${id}/playlists`,
      {
        name: 'your Spindr playlist',
        description: 'songs you swiped right on',
        public: false,
      }
    );

    let playlistId = playlist.data.id;
    let playlistUrl = playlist.data.external_urls.spotify;

    console.log(playlistUrl); //check to see if playlist was made

    return playlistId;
  } catch (err) {
    console.log(err);
  }
}

//add tracks to playlist, requires playlistId taken from createPlaylist
//frontend needs to store returned playlistId as a const in react app so it can be passed into addToPlaylist
export async function addToPlaylist(playlistId, tracks) {
  const [cookies] = useCookies(['access_token']);
  const token = cookies.get('access_token');
  const tokenType = cookies.get('token_type');

  //need to set header with token for axios fetch requests
  axios.defaults.headers.common['Authorization'] = `${tokenType}: ${token}`;

  try {
    const playlist = await axios.post(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        uris: tracks, //tracks need to be an string, comma-separated ex:  'spotify:track:4iV5W9uYEdYUVa79Axb7Rh,spotify:track:1301WleyT98MSxVHPZCA6M'
      }
    );

    console.log('successfully added tracks to playlist');
  } catch (err) {
    console.log(err);
  }
}
