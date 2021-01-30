var express = require('express');
var router = express.Router();
const toDoController = require('../controllers/todo')



router.get('/', toDoController.getAllToDo);
router.get('/:id', toDoController.getToDo);
router.post('/', toDoController.postToDo);
router.put('/:id', toDoController.putToDo);


router.use('/*', function(req, res){
  res.status(404).json({msg: 'Resource not found'});
});

module.exports = router;

