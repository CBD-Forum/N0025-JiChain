/**
 * Created by wangjimin on 17/5/8.
 */
var Poster = require("../model/sender");
var contract = require("../contract");
var BCMessageAdd = require('../model/message').BCMessageAdd;
var BCMessageQuery = require('../model/message').BCMessageQuery;
var BCMessageVerifyAdd = require('../model/message').BCMessageVerifyAdd;
var BCMessageTrans = require('../model/message').BCMessageTrans;
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
function addCoreData(data, callback) {
    var body = data;
    var msg = new BCMessageAdd([body.id, body.position, body.hash, body.category]);
    // console.log(contract.storeName);
    msg.params.chaincodeID.name = contract.storeName;
    console.log(JSON.stringify(msg));
    poster = new Poster(msg, function(err, resdata){
        if(err != null){
            console.log('err');
            callback(err, null);
        }
        callback(null, resdata);
    })
}
/**
 * 查看文档位置
 * @param data
 * @param callback
 */
function queryCoreData(data, callback){
    var body = data;
    var msg = new BCMessageQuery([body.id]);
    msg.params.chaincodeID.name = contract.storeName;
    console.log(JSON.stringify(msg));
    poster = new Poster(msg, function(err, resdata){
        if(err != null){
            console.log('err');
            callback(err, null);
        }
        callback(null, resdata);
    })
}
/**
 * 增加申请单的记录
 * @param data
 * @param callback
 */
function addApplicationLog(data, callback){
    var body = data;
    var msg = new BCMessageAdd([body.logId,
        body.applicationId,
        body.hospitalId,
        body.hospitalAgree,
        body.patientId,
        body.patientAgree]);
    msg.params.chaincodeID.name = contract.lookUpName;
    console.log(msg);
    poster = new Poster(msg, function (err, resdata) {
        if(err != null){
            console.log('err');
            callback(err, null);
        }
        callback(null, resdata);
    })
}

/**
 * 增加授权码。
 * @param data 病人/医院编号| 病人/医院授权码
 * @param callback
 */
function addVerifyCode(data, callback) {
    var body = data;
    var msg = new BCMessageAdd([body.id, body.verifyCode]);
    msg.params.chaincodeID.name = contract.verify;
    poster = new Poster(msg, function (err, resdata) {
        if(err != null){
            console.log('err');
            callback(err, null);
        }
        callback(null, resdata);
    });
}

/**
 * 验证授权码
 * @param args 医院编号| 医院授权码| 病人编号|病人授权码
 * @constructor
 */
function verify(data, callback) {
    var body = data;
    var msg = new BCMessageVerifyAdd([body.hospitalId, body.hospitalAgree, body.patientId, body.patientAgree]);
    msg.params.chaincodeID.name = contract.verify;
    poster = new Poster(msg, function (err, resdata) {
        if(err != null){
            console.log('err');
            callback(err, null);
        }
        callback(null, resdata);
    })
}

function addBalanceAcc(data, callback){
    var body = data;
    var msg = new BCMessageAdd([body.username, body.balance]);
    msg.params.chaincodeID.name = contract.transform;
    console.log("trans msg");
    console.log(JSON.stringify(msg));
    poster = new Poster(msg, function (err, resdata) {
        if(err != null){
            console.log('err');
            callback(err, null);
        }
        callback(null, resdata);
    });
}

function transBalance(data, callback) {
    var body = data;
    var msg = new BCMessageTrans([body.from, body.to, "100"]);
    msg.params.chaincodeID.name = contract.transform;
    poster = new Poster(msg, function (err, resdata) {
        if(err != null){
            console.log('err');
            callback(err, null);
        }
        callback(null, resdata);
    });
}

module.exports = {
    addCoreData: addCoreData,
    queryCoreData: queryCoreData,
    addApplicationLog: addApplicationLog,
    verify: verify,
    addVerifyCode: addVerifyCode,
    addBalanceAcc: addBalanceAcc,
    transBalance: transBalance
};
