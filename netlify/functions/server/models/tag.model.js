const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TagSchema = new Schema(
    {
        title: {
            type: String,
            unique: true,
            required: true,
            trim: true
        },
        slug: {
            type: String,
            unique: true,
            required: true,
        },
        posts: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            default: []
        }],
    }, {
        toJSON: {
            // doc: full Model Document
            // ret: Plain Object representation of doc
            // RESTfull APIs have a convention of using id instead of _id.
            transform: (doc, { _id, title, slug, posts }) => 
            ({ id: _id, title, slug, posts })
        }
    }
);

module.exports = mongoose.model('Tag', TagSchema);