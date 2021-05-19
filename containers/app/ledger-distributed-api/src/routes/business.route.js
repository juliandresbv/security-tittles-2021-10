const express = require('express');
const router = express.Router();

const {
  postTransaction
} = require('../controllers/business.controller');


router.post('/transaction', postTransaction);
/*
router.put('/', jwtMiddleware, txMiddleware, putToDo);
router.get('/', jwtMiddleware, getAllToDo);
router.get('/:id', jwtMiddleware, getToDo);
router.get('/:id/:history', jwtMiddleware, getToDoHistory)
*/

router.use('/*', function(req, res){
  res.status(404).json({msg: 'Resource not found'});
});

module.exports.businessRouter = router;
