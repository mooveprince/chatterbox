var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');

//DB Connection
var pg = require('pg');
var conString = process.env.DATABASE_URL;
var client = new pg.Client(conString);
client.connect();

var app = express();
app.set('port', process.env.PORT || 3000);

//socket setup
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('hogan-express'));
app.set('view engine', 'html');

//app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Make our sockets accessible to our router
app.use(function(req,res,next){
    req.io = io;
    next();
});

app.use('/', routes);

io.on('connection', function(socket){
    socket.on('chat', function(msgPair, callback){
        callback ( );
        io.emit('chat', msgPair);
    });
    socket.on('join', function (data, callback) {
        callback ( );
    });
});

//Isolated REST Calls
app.get('/messages', function (request, response) {
    client.query('select * from (SELECT * FROM chatterbox ORDER BY timestamp DESC LIMIT 10) as result order by timestamp asc', function(err, result) {
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { response.send(result.rows); }
    });
});

app.post("/addmessage", function (request, response) {
    var name = request.body.name;
    var message = request.body.message;
    var color = request.body.color;
    var timestamp = request.body.timestamp;
    client.query ('insert into chatterbox (name, message, color, timestamp) values($1, $2, $3, $4)',[name, message, color, timestamp], function (err, result) {
            if (err) {
                console.log("Err in inser.." + err);
            } else {
                response.send("Success");
            }
    });
});
/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
