var express = require('express');
var router = express.Router();
const {
  signin,
  signup,
  challange
} = require('../controllers/auth');

router.post('/challange', challange);
router.post('/signin', signin);
router.post('/signup', signup);

module.exports = router;

