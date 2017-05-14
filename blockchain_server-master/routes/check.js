/**
 * Created by jimin on 17/5/2.
 */
var express = require('express');
var router = express.Router();
var LocalModel = require('../model/localapplicationmodel');
var CoreData = require('../model/coredatamodel');
var assert = require('assert');
var BC = require('../blockchain/bcoperation');
var VerifyCode = require('../model/verifycode');

/**
 * 查询病历
 * reason
 */

router.post('/third/query/data', function (req, res, next) {
    CoreData.find({'reason': req.body.reason}, function (err, docs) {
        res.json(docs);
    })
});

/**
 * 增加申请单。
 */

router.post('/third/app', function (req, res, next) {
    var body = req.body;
    var app = new LocalModel({
        coreDataId: body.coreDataId,
        applicationId: body.applicationId,
        patientId: body.patientId,
        patientAgree: '3',
        hospitalId: body.hospitalId,
        hospitalAgree: '3',
        reason: body.reason,
        patientVerifyCode: "0",
        hospitalVerifyCode: "0"
    });
    app.save(function (err, result) {
       assert.equal(err, null);
       console.log("local data 1 saved");
       console.log(result);
        BC.addApplicationLog({
            "logId": result._id,
            "applicationId": result.applicationId,
            "hospitalId": result.hospitalId,
            "hospitalAgree": result.hospitalAgree,
            "patientId": result.patientId,
            "patientAgree": result.patientAgree
        }, function (err, r) {
            if(err == null){
                console.log("Add application log to block chain success!");
            }
        });
       res.json(result);
    });
});

/**
 * 轮询
 * patientId
 */
router.post('/patient/query', function(req, res, next) {
    LocalModel.find({"patientId": req.body.patientId}, function (err, docs) {
        res.json(docs);
    });
});

/**
 * 轮询
 * hospitalId
 */
router.post('/hospital/query', function (req, res, next) {
    LocalModel.find({"hospitalId": req.body.hospitalId}, function (err, docs) {
        res.json(docs);
    })
});

/**
 * 轮询
 * applicationId
 */
router.post('/third/query', function (req, res, next) {
    LocalModel.find({"applicationId": req.body.applicationId}, function (err, docs) {
        res.json(docs);
    })
});

/**
 * 第三方查看文档。
 * _id
 */
router.post('/third/query/check', function (req, res, next) {
    LocalModel.findOne({"_id": req.body._id, "applicationID": req.body.applicationID, "patientAgree": "1", "hospitalAgree": "1"}, function (err, doc) {
        // res.json(docs);
        if(err != null){
            res.json(err);
        }
        if(doc != null){
            console.log("application info ------------------ ");
            console.log(JSON.stringify(doc));
            // 第三方查看病历不需要走区块链了。。。
            // BC.verify({"patientId": doc.patientId, "patientAgree": doc.patientVerifyCode, "hospitalId": doc.hospitalId, "hospitalAgree": doc.hospitalVerifyCode}, function (err, result) {
            //     console.log(" verify on bc")
            // });
            BC.queryCoreData({"id" : doc.coreDataId}, function (err, result) {
                console.log("query data position on bc");
            });
            // patient + 100
            VerifyCode.findOne({"username": doc.patientId}, function (err, ver) {
                if(ver != null && ver.balance != null){
                    VerifyCode.update({"username": doc.patientId}, {$set: {"balance": ver.balance + 100}}, function (err, up) {
                        if(err == null){
                            console.log("/**************** patient + 100 *******************/");
                        }
                    });
                } else {
                    console.log("app balance is null");
                }
            });
            // patient - 100
            VerifyCode.findOne({"username": doc.applicationId}, function (err, ver) {
                if(ver != null && ver.balance != null){
                    VerifyCode.update({"username": doc.applicationId}, {$set: {"balance": ver.balance - 100}}, function (err, up) {
                        if(err == null){
                            console.log("/**************** applicationId - 100 *******************/");
                        }
                    })
                } else {
                    console.log("app balance is null");
                }
            });
            BC.transBalance({"from": doc.applicationID, "to": doc.patientId}, function (err, re) {
                if(err == null){
                    console.log("/**************** BC transfer 100 *******************/");
                }
            });
            CoreData.findOne({"_id": doc.coreDataId, "patientId": doc.patientId}, function (err, core) {
                res.json(core);
            });
        } else {
            res.json({result: "no data"});
        }
    });
});

/**
 * id 是申请单号， patientId 是当前病人编号，agree 是 verify 的同意状态。
 * id, patientId, agree
 */
router.post('/patient/verify', function(req, res, next) {
    LocalModel.findByIdAndUpdate(req.body._id, {$set:{patientAgree: req.body.agree, patientVerifyCode: req.body.verifyCode}},function(err,doc){
        console.log(doc); //MDragon
        res.json(doc);
    });
});

router.post('/hospital/verify', function (req, res, next) {
    LocalModel.findByIdAndUpdate(req.body._id, {$set:{hospitalAgree: req.body.agree, hospitalVerifyCode: req.body.verifyCode}},function(err,doc){
        console.log(doc); //MDragon
        res.json(doc);
    });
});

router.post('/third/query/check2', function (req, res, next) {
    BC.verify({"hospitalId": "admin", "hospitalAgree": "admin", "patientId": req.body.patientId, "patientAgree": req.body.verifyCode}, function (err, doc) {
        if(err == null){
            console.log("/****************** BC verify single success ***********************/");
        }
    });
    CoreData.find({"_id": req.body._id}, function (err, doc) {
        if(err == null){
            res.json(doc);
        }
    });
});

module.exports = router;
