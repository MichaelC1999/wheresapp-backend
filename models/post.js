const mongoose = require('mongoose')
const Schema = mongoose.Schema;

//build a schema that defines the form and the values of how a post should be created and stored in the database

const postSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    comments: [{
        creator: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true
        }
    }],
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    location: {
        type: String,
        required: true
    }
}, {timestamps: true});

module.exports = mongoose.model('Post', postSchema)