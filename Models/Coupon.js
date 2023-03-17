let mongoose = require("mongoose");
let Schema = mongoose.Schema;
const Config = require("../Config");

let coupon = new Schema({
    discountCode: {
        type: String
    },
    discountValue: {
        type: Number
    },
    // discountAmount: {
    //     type: Number
    // },
    limitofPurchaseUser: {
        type: Number
    },
    userList: [
        {
            // userId: {
            type: Schema.ObjectId,
            ref: 'users'
            // }
        }
    ],
    couponAvalible: {
        type: String,
        enum: Object.values(Config.APP_CONSTANTS.DATABASE.COUPON_STATUS),
        default: Config.APP_CONSTANTS.DATABASE.COUPON_STATUS.AVALIBLE
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    addedBy: {
        type: Schema.ObjectId,
        ref: "admin"
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("coupon", coupon)