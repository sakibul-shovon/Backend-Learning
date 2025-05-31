const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    postdata: {
        type: String,  // Changed from ObjectId to String
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Post', postSchema);