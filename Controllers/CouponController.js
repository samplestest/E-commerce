"use strict"

const Service = require("../Services").queries;
const Model = require("../Models");
const Config = require("../Config");
const codeGenrater = require("../Lib/CodeGenerator");

//Add Edit Coupon
async function addEditCoupon(payloadData, userData) {
    try {
        // let discountCode = codeGenrater.generateCode();
        // payloadData.discountCode = discountCode;

        payloadData.addedBy = userData._id;
        let coupon
        if (payloadData.couponId) {
            coupon = await Service.findAndUpdate(Model.Coupon, { _id: payloadData.couponId }, payloadData, { new: true, lean: true })
        }
        else {
            coupon = await Service.saveData(Model.Coupon, payloadData, { new: true, lean: true })
        }
        if (!coupon)
            return Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR
        return coupon
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//Fetch Coupon
async function fetchcoupon(queryData) {
    try {
        const { skip = 1, limit = 1, page = 1 } = queryData;
        let query = { isDeleted: false };
        let data = await Service.getData(Model.Coupon, { query }, {}, {})
        return {
            couponData: data
        }
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

module.exports = {
    addEditCoupon,
    fetchcoupon
}