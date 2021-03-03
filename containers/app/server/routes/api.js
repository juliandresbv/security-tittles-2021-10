var express = require('express');
var router = express.Router();
const {
  getAllToDo, 
  getToDo, 
  postToDo, 
  putToDo,
  getToDoHistory
} = require('../controllers/todo');
const {authTransactionMiddleware} = require('../controllers/transaction');


router.get('/', getAllToDo);
router.get('/:id', getToDo);
router.post('/', authTransactionMiddleware, postToDo);
router.put('/', authTransactionMiddleware, putToDo);


router.get('/:id/:history', getToDoHistory)

router.use('/*', function(req, res){
  res.status(404).json({msg: 'Resource not found'});
});

module.exports = router;

