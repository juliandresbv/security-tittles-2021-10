var express = require('express');
var router = express.Router();

const {
  postTransaction
} = require('../controllers/transaction');

router.post('/transaction', postTransaction);

module.exports = router;

