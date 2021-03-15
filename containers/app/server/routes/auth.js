var express = require('express');
var router = express.Router();
const {
  signin,
  signup,
  challange
} = require('../controllers/auth');

router.post('/challange', challange);
router.post('/signup', signup);
router.post('/signin', signin);

module.exports = router;

