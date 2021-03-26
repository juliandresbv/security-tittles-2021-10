var express = require('express');
var router = express.Router();

/* GET users listing. */
router.post('/', function(req, res, next) {
  console.log(req.body);
  res.json({id: "123", ...req.body});
});


router.get('/:id', function(req, res, next) {
  res.json({id: req.params.id, name: "random name"});
});

module.exports = router;
