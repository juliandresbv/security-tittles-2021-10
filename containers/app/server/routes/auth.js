var express = require('express');
var router = express.Router();
const {
  signin,
  signup,
  challange,
  whoami,
  jwtMiddleware,
  getPublicKeyClient
} = require('../controllers/auth');

router.post('/challange', challange);
router.post('/signup', signup);
router.post('/signin', signin);
router.get('/whoami', jwtMiddleware, whoami);
router.get('/publickey', jwtMiddleware, getPublicKeyClient);

module.exports = router;

