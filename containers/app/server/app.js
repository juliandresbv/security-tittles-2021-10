var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var swaggerRouter = require('./routes/swagger');
var todoRouter = require('./routes/todo');
var authRouter = require('./routes/auth');

var app = express();

app.disable('etag')

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api-docs', swaggerRouter);
app.use('/api/todo', todoRouter);
app.use('/api/auth', authRouter);

app.get('/*', (req, res) => {
  res.sendfile(path.join(__dirname, './public', 'index.html'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  let message = err.message;
  let error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({'error': {status: error.status, stack: error.stack}});
});

module.exports = app;
