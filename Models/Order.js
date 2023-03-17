let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let Config = require('../Config');

let orders = new Schema({
    addedBy: {
        type: Schema.ObjectId,
        ref: 'users',
    },
    orderStatus: {
        type: String,
        enum: Object.values(Config.APP_CONSTANTS.DATABASE.ORDER_STATUS),
        default: Config.APP_CONSTANTS.DATABASE.ORDER_STATUS.PENDING
    },
    orderNumber: {
        type: String,
        // unique: true
    },
    paymentMode: {
        type: String,
        enum: Object.values(Config.APP_CONSTANTS.DATABASE.PAYMENT_MODE)
    },
    // isPaid: {
    //     type: Boolean,
    //     default: false
    // },
    cartId: {
        type: Schema.ObjectId,
        ref: 'carts',
    },
    addressId: {
        type: Schema.ObjectId,
        ref: 'addresses'
    },
    order: [
        {
            productId: {
                type: Schema.ObjectId,
                ref: 'products'
            },
            price: {
                type: Number,
            },
            quantity: {
                type: Number,
            },
            totalPrice: {
                type: Number,
            },
            variantId: {
                type: Schema.ObjectId,
                ref: 'products'
            },
        }
    ],
    // productId: {
    //     type: Schema.ObjectId,
    //     ref: 'products'
    // },
    // price: {
    //     type: Number,
    // },
    // quantity: {
    //     type: Number,
    // },
    // variantId: {
    //     type: Schema.ObjectId,
    //     ref: 'products'
    // },
    discount: {
        type: Number,
        default: 0
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
});
module.exports = mongoose.model('Order', orders);
