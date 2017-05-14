/**
 * Created by wangjimin on 17/5/14.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
 * _id 就是病历编号*/
var VerifyCode = new Schema({
    username: String,
    verifyCode: String,
    balance: Number
});

module.exports = mongoose.model('verifycode',VerifyCode);