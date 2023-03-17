const { object } = require("joi");
let mongoose = require("mongoose");
const Config = require("../Config");
let Schema = mongoose.Schema

let offer = new Schema({
    name: {
        type: String,
        unique: true
    },
    discountType: {
        type: String,
        enum: Object.values(Config.APP_CONSTANTS.DATABASE.DISCOUNT_TYPE)
    },
    offerstatus: {
        type: String,
        enum: Object.values(Config.APP_CONSTANTS.DATABASE.OFFER_STATUS)
    },
    discoutnCode: {
        type: String,
        unique: true
    },
    discountCodeMethod: {
        type: String,
        enum: Object.values(Config.APP_CONSTANTS.DATABASE.DISCOUNT_CODE_METHOD)
    },
    discountValue: {
        type: Number
    },
    minimumPurchaseAmount: {
        type: Number
    },
    numberofPurchase: {
        type: Number,
    },
    limitofPurchaseUser: {
        type: Number
    },
    numberofUse: {
        type: Number,
        default: 0
    },
    startDate: {
        type: String
    },
    endDate: {
        typr: String
    },
    addedBy: {
        type: Schema.ObjectId,
        ref: "Admin"
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})
module.exports = mongoose.model('offers', offer)