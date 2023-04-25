# Spinder

This is my own branch.

Instead of querying the server endpoints and having the server make the API calls and returning that data, I fixed `fetch.js` so that you handle can fetch requests to the Spotify API in the React App. This is done at the expense of setting httponly to false for the access token. Not the best security, but it works. Good luck! :)) 

Take a look at my commits--I fixed some issues regarding double `bundle.js` injections. 

The server still handles oAuth from /login endpoint. 


