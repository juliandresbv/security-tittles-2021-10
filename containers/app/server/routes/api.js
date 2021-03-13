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

const {jwtMiddleware} = require('../controllers/auth');

router.get('/', jwtMiddleware, getAllToDo);
router.get('/:id', jwtMiddleware, getToDo);
router.post('/', jwtMiddleware, authTransactionMiddleware, postToDo);
router.put('/', jwtMiddleware, authTransactionMiddleware, putToDo);


router.get('/:id/:history', getToDoHistory)

router.use('/*', function(req, res){
  res.status(404).json({msg: 'Resource not found'});
});

module.exports = router;

