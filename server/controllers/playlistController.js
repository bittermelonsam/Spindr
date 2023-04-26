const db = require('../models/poolsModel.js');

const playlistController = {};

// get all the songs in one user's playlist
playlistController.getPlaylist = async (req, res, next) => {
  try {
      const { id } = req.params;
      const getList = {
          text: `SELECT  AS  AS 
          FROM 
          INNER JOIN  
          ON 
          WHERE `,
          values: []
      }

      const data = await db.query(getList);
      res.locals.playlist = data.rows;
      return next();

  } catch(err) {
      res.status(500).json({error: err.message});
  }
}

//post a song to DB
playlistController.addSong = async(req, res, next) => {
  try {
    const {id} = req.params; 
    const {song_id} = req.body; 

    const newList = {
    text: `INSERT INTO 
    VALUES ($1, $2)`,
    values: [],
    }
    const data = await db.query(newList);
    next();
    
  } catch(err) {
        res.status(500).json({error: err.message});
  }
}

// delete specific song from user's playlist
playlistController.deleteSong = async (req, res, next) => {
  try {
    const { id } = req.params; 
    const { song_id } = req.body; 
    const deleteSong = {
        text: `DELETE FROM playlist 
        WHERE user_id = $1 AND song_id = $2;`,
        values: [id, song_id],
      };

      const data = await db.query(deleteSong);
      return next();

  } catch(err) {
    res.status(500).json({error: err.message});
  }
}

module.exports = playlistController;