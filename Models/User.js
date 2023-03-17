let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let Users = new Schema({
    first_name: {
        type: String,
    },
    last_name: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    accessToken: {
        type: String,
    },
    image: {
        type: String
    }
}, {
    timestamps: true
});
module.exports = mongoose.model('User', Users);