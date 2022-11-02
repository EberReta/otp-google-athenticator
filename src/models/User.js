const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
    name: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String
    },
    plan_id: {
        type: String
    },
    secret: {
        type: String
    },
});

module.exports = model('User', UserSchema);