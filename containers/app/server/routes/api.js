var express = require('express');
var router = express.Router();
const toDoController = require('../controllers/todo');
const {authTransactionMiddleware, postTransaction, putTransaction} = require('../controllers/transaction');


router.get('/', toDoController.getAllToDo);
router.get('/:id', toDoController.getToDo);
router.post('/', authTransactionMiddleware, postTransaction);
router.put('/', authTransactionMiddleware, putTransaction);


router.use('/*', function(req, res){
  res.status(404).json({msg: 'Resource not found'});
});

module.exports = router;

