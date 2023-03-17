let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let Brand = new Schema({
    name: {
        type: String
    },
    addedBy: {
        type: Schema.ObjectId,
        ref: "Admins"
    },
    active: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
});
module.exports = mongoose.model('Brands', Brand);