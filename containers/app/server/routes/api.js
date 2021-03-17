var express = require('express');
var router = express.Router();
const {
  getAllToDo, 
  getToDo, 
  postToDo, 
  putToDo,
  getToDoHistory
} = require('../controllers/todo');

const {
  txMiddleware,
  jwtMiddleware
} = require('../controllers/auth');

router.get('/', jwtMiddleware, getAllToDo);
router.get('/:id', jwtMiddleware, getToDo);
router.post('/', jwtMiddleware, txMiddleware, postToDo);
router.put('/', jwtMiddleware, txMiddleware, putToDo);
router.get('/:id/:history', jwtMiddleware, getToDoHistory)

router.use('/*', function(req, res){
  res.status(404).json({msg: 'Resource not found'});
});

module.exports = router;

