let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let Cart = new Schema({
    addedBy: {
        type: Schema.ObjectId,
        ref: 'users'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    products: [
        {
            productId: {
                type: Schema.ObjectId,
                ref: 'products',
            },
            price: {
                type: Number
            },
            quantity: {
                type: String,
                default: 1
            },
            variantId: {
                type: Schema.ObjectId,
                ref: 'Products'
            }

        }
    ],
    // discount: {
    //     type: Number,
    //     default: 0
    // }
}, {
    timestamps: true
});
module.exports = mongoose.model('Cart', Cart);