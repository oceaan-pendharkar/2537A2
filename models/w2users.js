const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    "username": { type: String, unique: true },
    "password": String,
    "type": String,
    "todos": [{
        "name": String,
        "done": { type: Boolean, default: false }
    }]
});

const usersModel = mongoose.model('w2users', userSchema);

module.exports = usersModel;