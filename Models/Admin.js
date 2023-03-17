let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let Admin = new Schema({
    fullName: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String
    },
    role: {
        type: String
    },
    mobile: {
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
    isAccept: {
        type: Boolean,
        default: false
    },
    addedBy: {
        type: Schema.ObjectId,
        ref: "Admin"
    },
    accessToken: {
        type: String
    }
}, {
    timestamps: true
});
module.exports = mongoose.model("admins", Admin)