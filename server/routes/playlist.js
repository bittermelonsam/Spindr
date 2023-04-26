const express = require('express');
const router = express.Router();

const playlistController = require('../controllers/playlistController');

router.get('/:id/playlist', playlistController.getPlaylist, (req, res) => {
  return res.status(200).json(res.locals.playlist);
})

router.post('/:id/playlist', playlistController.addSong, (req, res) => {
  return res.sendStatus(200);
})

router.delete('/:id/playlist', playlistController.deleteSong, (req, res) => {
  return res.status(200).json(res.locals.deleteSong);
});