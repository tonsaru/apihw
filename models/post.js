// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Post', new Schema({
    id: {
        type: Number,
        required: true,
        unique: true,
    },
    userId: {
        type: Number,
        required: true,
        trim: true,
    },
    title: {
        type: String,
        required: true,
    }, 
    body: {
        type: String,
        required: true,
    },
    created: {
        type: Date,
        default: Date.now
    }
}));