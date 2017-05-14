/**
 * Created by jimin on 17/5/2.
 */
var config = require('../config');
var BCMessageObj = function(){
    return {
        "jsonrpc": "2.0",
        "method": "调用方法",
        "params": {
            "type": 1,
            "chaincodeID": {
                "name": config.contractName
            },
            "ctorMsg": {
                "function":"函数名",
                "args":[ "参数1", "参数2","参数3","参数4"]
            }
        },
        "id": 0

    }
};

// 在区块链上增加病历存储位置信息。或
// 在区块链上增加病历查看记录的信息。
/**
 *
 * @param args 增加的病历编号| 病历在数据库中的位置 | 病历hash指纹 |病历疾病类型 或
 * 查看请求编号| 请求发起者编号| 医院编号 | 医院授权情况 |病人编号 |病人授权情况
 * @returns {BCMessageObj}
 * @constructor
 */
function BCMessageAdd (args) {
    var msg = new BCMessageObj();
    msg.method = "invoke";
    msg.params.ctorMsg.function = "add";
    msg.params.ctorMsg.args = args;
    return msg;
}

// 在区块链上查询病历存储位置信息。
/**
 *
 * @param args 病历编号
 * @returns {BCMessageObj}
 * @constructor
 */
function BCMessageQuery(args){
    var msg = new BCMessageObj();
    msg.method = "query";
    msg.params.ctorMsg.function = "query";
    msg.params.ctorMsg.args = args;
    return msg;
}

// 转账消息
function BCMessageTrans(args){
    var msg = new BCMessageObj();
    msg.method = "invoke";
    msg.params.ctorMsg.function = "transfer";
    msg.params.ctorMsg.args = args;
    return msg;
}

// 在区块链上查询申请记录的信息。
/**
 *
 * @param args 查看请求编号
 * @returns {BCMessageObj}
 * @constructor
 */
function BCMessageQueryApplicationLog(args){
    var msg = new BCMessageObj();
    msg.method = "query";
    msg.params.ctorMsg.function = "test";
    msg.params.args = args;
    return msg;
}

// 授权信息
/**
 *
 * @param args 病人/医院编号| 病人/医院授权码
 * @constructor
 */
function BCMessageVerifyAdd(args) {
    var msg = new BCMessageAdd();
    return msg;
}
/**
 *
 * @param args 医院编号| 医院授权码| 病人编号|病人授权码
 * @constructor
 */
function BCMessageVerify(args){
    var msg = new BCMessageObj();
    msg.method = "query";
    msg.params.ctorMsg.function = "verify";
    msg.params.ctorMsg.args = args;
}

function BCMessage(jsonrpc, method, params, id) {
    this.jsonrpc = jsonrpc;
    this.method = method;
    this.params = params;
    this.id = id;
    if ('undefined' == typeof BCMessage._initialized) {
        BCMessage.prototype.setJsonrpc = function (j) {
            this.jsonrpc = j;
        }
        BCMessage.prototype.setChaincodeIdName = function (id) {
            this.params.chaincodeID.name = id;
        }
        BCMessage.prototype.setMethod = function (me) {
            this.method = me;
        }
        BCMessage.prototype.setId = function (id) {
            this.id = id;
        }
        BCMessage.prototype.setParams = function (pa) {
            this.params = pa;
        }
    }
    BCMessage._initialized = true;
}

function CtorMsg(func, args){
    this.func = func;
    this.args = args;
}

function ChaincodeId(name) {
    this.name = name;
}

/*
"params": {
 "type": 1,
 "chaincodeID": {
 "name": config.contractName
    },
 "ctorMsg": {
 "function":"函数名",
 "args":[ "参数1", "参数2","参数3","参数4"]
    }
 }
*/

function Params(type, chaincodeId, ctorMsg) {
    this.type = type;
    this.chaincodeID = chaincodeId;
    this.ctorMsg = ctorMsg;
}

exports.BCMessage = BCMessage;
exports.CtorMsg = CtorMsg;
exports.ChaincodeId = ChaincodeId;
exports.Params = Params;
exports.BCMessageObj = BCMessageObj;
exports.BCMessageAdd = BCMessageAdd;
exports.BCMessageQuery = BCMessageQuery;
exports.BCMessageQueryApplicationLog = BCMessageQueryApplicationLog;
exports.BCMessageVerifyAdd = BCMessageVerifyAdd;
exports.BCMessageVerify = BCMessageVerify;
exports.BCMessageTrans = BCMessageTrans;