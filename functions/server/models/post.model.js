const mongoose = require('mongoose');
const moment = require('moment');

const Schema = mongoose.Schema;

const PostSchema = new Schema(
    {
        title: {
            type: String,
            trim: true
        },
        body: {
            type: String,
            trim: true
        },
        preview: {
            type: String,
            trim: true
        },
        titulo: {
            type: String,
            trim: true
        },
        cuerpo: {
            type: String,
            trim: true
        },
        previo: {
            type: String,
            trim: true
        },
        author: {
            type: String,
            default: 'Ángel Casas Pescador'
        },
        section: {
            type: String,
            required: true,
            trim: true
        },
        cover: {
            type: String,
            trim: true,
        },
        comments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
            default: []
        }],
        date: {
            type: Date,
            default: Date.now
        },
        tags: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tag',
            default: []
        }],
    }, {
        toJSON: {
            // doc: full Model Document
            // ret: Plain Object representation of doc
            // RESTfull APIs have a convention of using id instead of _id.
            transform: (doc, { _id, title, body, preview, titulo, cuerpo, previo, author, section, cover, comments, date, tags }) => 
            ({ id: _id, title, body, preview, titulo, cuerpo, previo, author, section, cover, comments, date, tags })
        }
    }
);

// Virtual for post's URL
PostSchema.virtual('url').get(function() {
    return 'posts/' + this.section + '/' + this._id;
});

// Virtual for post's Time format
PostSchema.virtual('post_time_formatted').get(function() {
    return moment(this.date).format('MMM Do, YYYY');
});

// Virtual for post's Tags list to String
PostSchema.virtual('tag_list').get(function() {
    return this.tags.join(' ');
});

module.exports = mongoose.model('Post', PostSchema);