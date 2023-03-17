let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let review = new Schema({
    productId: {
        type: Schema.ObjectId,
        ref: 'product'
    },
    review: {
        type: String,
    },
    rating: {
        type: Number
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isPublish: {
        type: Boolean,
        default: false
    },
    addedBy: {
        type: Schema.ObjectId,
        ref: 'user'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('review', review)