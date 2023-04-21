const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CommentSchema = new Schema(
    {
        name: {
            type: String,
            trim: true
        },
        body: {
            type: String,
            trim: true
        },
        approved: {
            type: Boolean,
            default: false
        },
        date: {
            type: Date,
            default: Date.now
        }
    }, {
        toJSON: {
            // doc: full Model Document
            // ret: Plain Object representation of doc
            // RESTfull APIs have a convention of using id instead of _id.
            transform: (doc, { _id, name, body, approved, date, post }) => 
            ({ id: _id, name, body, approved, date, post })
        }
    }
);

module.exports = mongoose.model('Comment', CommentSchema);