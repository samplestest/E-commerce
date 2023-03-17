let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let Wishlist = new Schema({
    addedBy: {
        type: Schema.ObjectId,
        ref: 'users'
    },
    items: [{
        type: String,
    }]
}, {
    timestamps: true
});
module.exports = mongoose.model('Wishlist', Wishlist);