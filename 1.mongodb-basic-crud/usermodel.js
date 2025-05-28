const mongoose = require('mongoose');

// Add connection options and error handling
mongoose.connect('mongodb://localhost:27017/mongopractice');


const userSchema = mongoose.Schema({
    name: String,
    username: String,
    email: String,
});

module.exports = mongoose.model('user', userSchema);