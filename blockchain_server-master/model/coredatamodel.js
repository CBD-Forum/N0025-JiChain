/**
 * Created by jimin on 17/5/2.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
* _id 就是病历编号*/
var CoreDataModel = new Schema({
    patientId: String,
    hospitalId: String,
    reason: String,
    content: String,
    date: String,
    admin: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('coredata',CoreDataModel);