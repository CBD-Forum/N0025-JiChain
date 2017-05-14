var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var CoreDataModel = require('./model/coredatamodel');
var assert = require('assert');
var db = require('./model/datebase');
var LocalModel = require('./model/localapplicationmodel');
var BC = require('./blockchain/bcoperation');

// database connection.
// mongoose.connect(config.mongoUrl);
// var db = mongoose.connection;
db.on('error',console.error.bind(console, 'connection error: '));
db.once('open',function () {
    console.log('Mongoose Server connected.');
    //初始化先删除所有本地申请信息和病历信息。
    CoreDataModel.remove({}, function (err) {

    });
    LocalModel.remove({}, function (err) {

    });
    //初始化本地申请信息和病历信息。

    /************* 病历信息 ***************/
    var coreData1 = new CoreDataModel({
        patientId: 1001,
        hospitalId: 2001,
        date: "2001",
        reason: "heart",
        content: "heart content",
    });
    var coreData2 = new CoreDataModel({
        patientId: 1002,
        hospitalId: 2002,
        reason: "cold",
        date: '2006',
        content: "cold content",
    });
    var coreData3 = new CoreDataModel({
        patientId: 1003,
        hospitalId: 2002,
        date: "2003",
        reason: "heart",
        content: "heart content",
    });

    coreData1.save(function(err, result){
        assert.equal(err, null);
        console.log("coredata 1 saved");
        console.log(result._id);
        // 本地数据上传区块链
        BC.addCoreData({
            "id": result._id,
            "position": result.hospitalId,
            "hash": result._id,
            "category": result.reason
        }, function (err, response) {
            if(err == null){
                console.log("save in block");
                console.log(response);
            } else {
                console.log("error-------");
                console.log(err);
            }
        })
    });
    coreData2.save(function(err, result){
        assert.equal(err, null);
        console.log("coredata 2 saved");
        console.log(result._id);
        // 本地数据上传区块链
        BC.addCoreData({
            "id": result._id,
            "position": result.hospitalId,
            "hash": result._id,
            "category": result.reason
        }, function (err, response) {
            if(err == null){
                console.log("save in block");
                console.log(response);
            } else {
                console.log("error-------");
                console.log(err);
            }
        })
    });
    coreData3.save(function(err, result){
        assert.equal(err, null);
        console.log("coredata 3 saved");
        // 本地病历上传区块链
        console.log(result._id);
        BC.addCoreData({
            "id": result._id,
            "position": result.hospitalId,
            "hash": result._id,
            "category": result.reason
        }, function (err, response) {
            if(err == null){
                console.log("save in block");
                console.log(response);
            } else {
                console.log("error-------");
                console.log(err);
            }
        })
    });
    /***************** 本地申请信息 ******************/
});
// routers.
var routes = require('./routes/index');
var users = require('./routes/users');
var test = require('./routes/test');
var check = require('./routes/check');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//passport config
var User = require('./model/user');
app.use(passport.initialize());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next){
    res.set('Access-Control-Allow-Origin','*');
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
// use routers.
app.use('/', routes);
app.use('/users', users);
app.use('/test', test);
app.use('/check', check);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: {}
    });
});

module.exports = app;
