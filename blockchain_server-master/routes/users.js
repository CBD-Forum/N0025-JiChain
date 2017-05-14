var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../model/user');
var Verify    = require('./verify');
var mongoose = require('mongoose');
var config = require('../config');
var db = require('../model/datebase');
var CoreDataModel = require('../model/coredatamodel');
var BC = require('../blockchain/bcoperation');
var VerifyCode = require('../model/verifycode');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/register', function(req, res) {
    console.log("username: " + req.body.username);
    User.register(new User({ username : req.body.username,
            role: req.body.role}),
        req.body.password, function(err, user) {
            if (err) {
                res.set('Access-Control-Allow-Origin','*');
                return res.status(500).json({err: err});
            }
            passport.authenticate('local')(req, res, function () {
                res.set('Access-Control-Allow-Origin','*');
                var code = new VerifyCode({
                    username: req.body.username,
                    verifyCode: req.body.verifyCode,
                    balance: req.body.balance
                });
                code.save(function (err, doc) {
                    if(err != null){
                        console.log("save verify code failed");
                    }
                    console.log("/**************** save verifyCode *******************" + doc.status);
                    console.log(doc);
                });
                BC.addVerifyCode({"id":req.body.username, "verifyCode":req.body.verifyCode}, function (err, data) {
                    console.log("BC_OPERATION: " + "add verify success" + " : " + req.body.username);
                    console.log(data);
                });
                BC.addBalanceAcc({"username": req.body.username, "balance": req.body.balance.toString()}, function (err, data) {
                    if(err == null){
                        console.log("/******************* BC add balance acc success ***********************/" + data.status);
                    }
                });
                return res.status(200).json({status: 'Registration Successful!'});
            });
        });
});

router.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            // res.set('Access-Control-Allow-Origin','*');
            return res.status(401).json({
                err: info
            });
        }
        req.logIn(user, function(err) {
            if (err) {
                // res.set('Access-Control-Allow-Origin','*');
                return res.status(500).json({
                    err: 'Could not log in user'
                });
            }

            console.log(user);
        if (user.role=="1"){
            CoreDataModel.find({'patientId': user.username}, ['patientId', 'reason', 'hospitalId', 'date','content'], function (err, docs) {
                console.log(docs);
                // res.set('Access-Control-Allow-Origin','*');
                VerifyCode.findOne({"username": user.username},function (err, doc) {
                    res.status(200).json({
                        id: user._id,
                        username: user.username,
                        role: user.role,
                        status: 'Login successful!',
                        data: docs,
                        verifyCode: doc.verifyCode,
                        balance: doc.balance,
                        success: true
                    });
                });
            });}
            else {
            CoreDataModel.find({'hospitalId': user.username}, ['patientId', 'reason', 'hospitalId', 'date','content'], function (err, docs) {
                console.log(docs);
                // res.set('Access-Control-Allow-Origin','*');
                VerifyCode.findOne({"username": user.username},function (err, doc) {
                    res.status(200).json({
                        id: user._id,
                        username: user.username,
                        role: user.role,
                        status: 'Login successful!',
                        data: docs,
                        verifyCode: doc.verifyCode,
                        balance: doc.balance,
                        success: true
                    });
                });
            });

            }
        });
    })(req,res,next);
});

router.post('/changeverifycode', function (req, res, next) {
   VerifyCode.update({username: req.body.username}, {$set: {verifyCode: req.body.verifyCode}}, function (err, doc) {
       if(err == null){
           console.log(doc);
           BC.addVerifyCode({"id":req.body.username, "verifyCode":req.body.verifyCode}, function (err, data) {
               console.log("BC_OPERATION: " + "add verify success" + " : " + req.body.username);
               console.log(data);
           });
       }
       res.json(doc);
   }) 
});

router.post('/getverifycode', function (req, res, next) {
    VerifyCode.findOne({"username": req.body.username}, function (err, doc) {
        if(err == null)
            res.json(doc);
    })
});

router.get('/logout', function(req, res) {
    req.logout();
    res.status(200).json({
        status: 'Bye!'
    });
});

module.exports = router;