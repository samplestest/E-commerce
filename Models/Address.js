let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let Address = new Schema({
    city: {
        type: String,
    },
    zipcode: {
        type: String,
    },
    state: {
        type: String
    },
    area: {
        type: String
    },
    addedBy: {
        type: Schema.ObjectId,
        ref: 'Users'
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
});
module.exports = mongoose.model('Address', Address);