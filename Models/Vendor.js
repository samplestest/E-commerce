let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let vendors = new Schema({
    fullName: {
        type: String,
    },
    email: {
        type: String
    },
    password: {
        type: String,
    },
    mobile: {
        type: String
    },
    gender: {
        type: String
    },
    gstNo: {
        type: String
    },
    idProof: {
        adharCardFront: {
            type: String
        }
    },
    pickupAddress: {
        pincode: {
            type: String
        },
        address: {
            type: String
        },
        location: {
            type: String
        },
        city: {
            type: String
        },
        state: {
            type: String
        }
    },
    bankDetails: {
        bankName: {
            type: String
        },
        accountNo: {
            type: String
        },
        isfc: {
            type: String
        },
        accountHolderName: {
            type: String
        }
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isReject: {
        type: Boolean,
        default: false
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    accessToken: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('vendors', vendors);