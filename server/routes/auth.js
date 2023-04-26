const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

router.post('/login', authController.login, (req, res) => {
    return res.status(200).send(res.locals.loginUser)
});
router.post('/register',authController.register, (req, res) => {
  return res.status(200).send(res.locals.insertUser)
});

module.exports = router;