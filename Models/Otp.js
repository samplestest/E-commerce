let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let Config = require('../Config').APP_CONSTANTS;

let Otp = new Schema({
    countryCode: {
        type: String,
    },
    phoneNumber: {
        type: String,
    },
    email: {
        type: String,
    },
    code: {
        type: String,
        trim: true,
        required: true
    },
    type: { type: String, trim: true, sparse: true, enum: Object.values(Config.DATABASE.OTP_TYPE) },
    status: { type: Number, default: 1 }, //1 - Unused ,2 - Used
    addedBy: {
        type: Schema.ObjectId,
        ref: 'Users'
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Otp', Otp);