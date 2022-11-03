const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    secret: {
        type: String
    },
});

module.exports = model('User', UserSchema);