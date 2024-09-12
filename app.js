require('dotenv').config();

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var passport = require('passport');
var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
let date = require('date-and-time');
let log = require('./helper/log');

require('./config/database'); // have global var connection
require('./helper/passport')(passport); // pass passport for configuration

var app = express();
var rooms = {};

// Server Run Date
Number.prototype.padLeft = function (base, chr) {
    var len = (String(base || 10).length - String(this).length) + 1;
    return len > 0 ? new Array(len).join(chr || '0') + this : this;
}

let now = new Date;
var runDateFormat = date.format(now, "DD-MM-YYYY HH:mm:ss");

var server_port = 3000; // server port
app.set('port', server_port); // set server port
var server = app.listen(server_port, function () {
    console.log('\n\n=============== ' + runDateFormat + ' =================');
    console.log("Simantiz apps listening on port " + server_port + "!\n");
}); // start server

// Socket.io
app.io = require("socket.io").listen(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({
    extended: true
})); // get information from html forms

app.use(session({
    secret: 'z1tn4m1srockssession',
    resave: true,
    saveUninitialized: true
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

//
//
// // uncomment after placing your favicon in /public
// //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


var roommodel = require('./models/rooms');
var roomobj = new roommodel(rooms);

var users = require('./models/users');
var socks = require('./controllers/socks');

app.use(require('./controllers/router')(app.io, passport, roomobj, users));

app.io.on("connection", function (socket) {
    socks.listen(socket, app.io, roomobj, users);
});

//
// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });
//
// // error handlers
//
// // development error handler
// // will print stacktrace
// if (app.get('env') === 'development') {
//   app.use(function(err, req, res, next) {
//     res.status(err.status || 500);
//     res.render('error', {
//       message: err.message,
//       error: err
//     });
//   });
// }
//
// // production error handler
// // no stacktraces leaked to user
// app.use(function(err, req, res, next) {
//   res.status(err.status || 500);
//   res.render('error', {
//     message: err.message,
//     error: {}
//   });
// });
//
process.stdin.resume();//so the program will not close instantly

function exitHandler(options, err) {
    if (options.cleanup) console.log('clean');
    if (err) console.log(err.stack);
    if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));

module.exports = app;
