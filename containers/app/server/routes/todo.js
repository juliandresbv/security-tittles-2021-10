var express = require('express');
var router = express.Router();
const {
  getAllToDo, 
  getToDo, 
  postToDo, 
  putToDo,
  getToDoHistory,
  getDashboard,
  getResumen,
  getCreate
} = require('../controllers/todo');

const {
  txMiddleware,
  jwtMiddleware
} = require('../controllers/auth');


router.post('/', jwtMiddleware, txMiddleware, postToDo);
router.put('/', jwtMiddleware, txMiddleware, putToDo);
router.get('/', jwtMiddleware, getAllToDo);
router.get('/dashboard', jwtMiddleware, getDashboard);
router.get('/create', jwtMiddleware, getCreate);
router.get('/resumen', jwtMiddleware, getResumen);
router.get('/:id', jwtMiddleware, getToDo);
router.get('/:id/:history', jwtMiddleware, getToDoHistory)

router.use('/*', function(req, res){
  res.status(404).json({msg: 'Resource not found'});
});

module.exports = router;

