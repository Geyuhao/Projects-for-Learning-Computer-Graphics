var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var flash = require('express-flash');
var session = require('express-session');
var db=require('./database');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const { VARCHAR } = require('mysql/lib/protocol/constants/types');

var app = express();

var visit_count = 0;
var comment_count = 0;
 
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
 
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('src/MP3'));

// app.use('/', indexRouter);
app.use('/users', usersRouter);

app.engine('html', require('ejs').renderFile);

app.use(session({ 
    secret: '123456catr',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))
 
app.use(flash());
 
/* GET home page. */
app.get('/', function(req, res, next) {
  console.log('Someone visit your web !');
  res.render('MP3.html', { title: 'main page' });
  visit_count += 1;
  console.log('# visit is',visit_count,'# comment is',comment_count);
});
 
function getClientIp(req) {
  return req.headers['x-forwarded-for'] ||
  req.connection.remoteAddress ||
  req.socket.remoteAddress ||
  req.connection.socket.remoteAddress;
};

app.post('/user', function(req, res, next) {
  var name = req.body.name;
  var message = req.body.message;
  var ip = getClientIp(req);
  comment_count += 1;

  var sql = `INSERT INTO 418mp3 (name, message, ip, created_at) VALUES ("${name}", "${message}", "${ip}", NOW())`;
  db.query(sql, function(err, result) {
    if (err) throw err;
    console.log('record inserted');
    req.flash('success', 'Data added successfully!');
    res.redirect('/');
  });
});

 
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
 
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
 
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
 
// port must be set to 3000 because incoming http requests are routed from port 80 to port 8080
// app.listen(3000, function () {
//     console.log('Node app is running on port 3000');
// });
 
module.exports = app;