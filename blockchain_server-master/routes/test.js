/**
 * Created by jimin on 17/5/2.
 */
var express = require('express');
var router = express.Router();
var BCMessageAdd = require('../model/message').BCMessageAdd;
var BCMessageQuery = require('../model/message').BCMessageQuery;
var BCMessageVerifyAdd = require('../model/message').BCMessageVerifyAdd;
var BCMessageVerify = require('../model/message').BCMessageVerify;
var contract = require('../contract');
var config = require('../config');
var Poster = require('../model/sender');
var BC = require('../blockchain/bcoperation');

/********************* 下面所有的请求都是 nodejs server 对区块链的请求 *********************/
/********************* 下面所有的请求都是 nodejs server 对区块链的请求 *********************/
/********************* 下面所有的请求都是 nodejs server 对区块链的请求 *********************/

router.get('/msg', function(req, res, next){
    var msg = new BCMessage();
    console.log(JSON.stringify(msg));
    res.json(msg);
});
/*************************************** 病历存储模块 ***************************************/

/**
 * 向区块链中加入病历信息。
 *
 * post body: {
 *      "id":
 *      "position":
 *      "hash":
 *      "category":
 *  }
 */
router.post('/adder/data', function (req, res, next) {

    var body = req.body;
    var msg = new BCMessageAdd([body.id, body.position, body.hash, body.category]);
    // console.log(contract.storeName);
    msg.params.chaincodeID.name = contract.storeName;
    console.log(JSON.stringify(msg));
    poster = new Poster(msg, function(err, resdata){
        if(err != null){
            console.log('err');
        }
        console.log(resdata);
        res.json(resdata);
    })

});

/**
 * 查看区块链中的病历信息。
 *
 * post body:{
 *      "id":
 *  }
 */
router.post('/query/data', function(req, res, next){
    var body = req.body;
    var msg = new BCMessageQuery([body.id]);
    msg.params.chaincodeID.name = contract.storeName;
    console.log(JSON.stringify(msg));
    poster = new Poster(msg, function(err, resdata){
        if(err != null){
            console.log('err');
        }
        console.log(resdata);
        res.json(resdata);
    })
});
/*************************************** 病历存储模块 ***************************************/




/*************************************** 病历查看记录模块 ***************************************/


/**
 * 查看请求编号| 请求发起者编号| 医院编号 | 医院授权情况 |病人编号 |病人授权情况
 */
router.post('/add/datalog', function (req, res, next) {
    var body = req. body;
    var msg = new BCMessageAdd([req.logId, req.applicationId, req.hospitalId, req.hospitalAgree, req.patientId, req.patientAgree]);
    msg.params.chaincodeID.name = contract.lookUpName;
    console.log(msg);
    poster = new Poster(msg, function (err, resdata) {
        if(err != null){
            console.log('err');
        }
        console.log(resdata);
        res.json(resdata);
    })
});

/**
 * 查看请求编号
 */

router.post('query/datalog', function (req, res, next) {
    var body = req.body;
    var msg = new BCMessageQueryApplicationLog([body.logId]);
    msg.params.chaincodeID.name = contract.lookUpName;
    poster = new Poster(msg, function (err, resdata) {
        if(err != null){
            console.log('err');
        }
        console.log(resdata);
        res.json(resdata);
    })
});


/*************************************** 病历查看记录模块 ***************************************/






/*************************************** 病历验证模块 ***************************************/

/**
 * 病人/医院编号| 病人/医院授权码
 */

router.post('add/verify', function (req, res, next) {
    // BC.addVerifyCode({"id":req.body.id, "verifyCode":req.body.code}, function (err, data) {
    //     res.json(data);
    // });
    res.json("test");
});

router.post('/test', function (req, res, next) {
    // res.json("test");
    BC.addVerifyCode({"id":req.body.id, "verifyCode":req.body.code}, function (err, data) {
        res.json(data);
    });
});

/**
 * 医院编号| 医院授权码| 病人编号|病人授权码
 */

router.post('query/verify', function (req, res, next) {
    var body = req.body;
    var msg = new BCMessageVerifyAdd([body.hospitalId, body.hospitalVerify, body.patientId, body.patientVerify]);
    msg.params.chaincodeID.name = contract.verify;
    poster = new Poster(msg, function (err, resdata) {
        if(err != null){
            console.log('err');
        }
        console.log(resdata);
        res.json(resdata);
    })
});

/*************************************** 病历验证模块 ***************************************/


module.exports = router;