let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let Config = require('../Config');

let Products = new Schema({
    name: {
        type: String,
    },
    // code: {
    //     type: String,
    // },
    status: {
        type: Boolean,
        default: true
    },
    isPublic: {
        type: Boolean,
        default: true,
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isReject: {
        type: Boolean,
        default: false
    },
    images: [
        {
            type: String,
        }
    ],
    description: {
        type: String,
    },
    price: {
        type: String,
    },
    categoryId: {
        type: Schema.ObjectId,
        ref: 'categroys',
    },
    subcategoryId: {
        type: Schema.ObjectId,
        ref: 'categroys',
    },
    specificcategoryId: {
        type: Schema.ObjectId,
        ref: 'categroys',
    },
    discount: {
        type: Number,
        default: 0
    },
    tax: {
        type: Number,
        default: 0
    },
    productAvailable: {
        type: String,
        enum: Object.values(Config.APP_CONSTANTS.DATABASE.PRODUCT_STATUS),
        default: Config.APP_CONSTANTS.DATABASE.PRODUCT_STATUS.STOCK
    },
    variants: [
        {
            sku: {
                type: String
            },
            title: {
                type: String
            },
            price: {
                type: Number
            },
            qty: {
                type: Number,
                default: 0
            },
            variantAvailable: {
                type: String,
                enum: Object.values(Config.APP_CONSTANTS.DATABASE.PRODUCT_STATUS),
                default: Config.APP_CONSTANTS.DATABASE.PRODUCT_STATUS.STOCK
            },
            variantImage: {
                type: String
            }

        }
    ],
    isDeleted: {
        type: Boolean,
        default: false
    },
    addedBy: {
        type: Schema.ObjectId
    }
}, {
    timestamps: true
});
module.exports = mongoose.model('products', Products);