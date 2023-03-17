"use strict"

const Service = require("../Services").queries;
const Model = require("../Models");
const Config = require("../Config");
const UniversalFunctions = require("../Utils/UniversalFunction");
const Joi = require('joi');

//Add Edit Offer
async function addEditOffer(payloadData, userData) {
    try {
        const exit = await Service.findOne(Model.Offer, { name: payloadData.name }, { new: true, lean: true })
        if (exit)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.OFFER_ALREADY_EXIT)
        let offer
        if (payloadData.offerId) {
            offer = await Service.findAndUpdate(Model.Offer, { _id: payloadData.offerId }, payloadData, { new: true, lean: true })
        } else {
            offer = await Service.saveData(Model.Offer, payloadData, { lean: true, new: true })
        }
        if (!offer)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        return offer
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//Fetch Offer
async function fetchOffer(queryData, userData) {
    try {
        const { skip = 1, limit = 1, page = 1 } = queryData;
        let query = { isDeleted: false };
        let options = { sort: { createdAt: -1 } }
        if (typeof skip !== "undefine" && typeof limit !== "undefined") {
            options = { skip: ((page - 1) * limit), limit: limit * 1 };
        }
        const data = await Service.getData(Model.Offer, { query }, {}, options)
        return {
            offerData: data
        }
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
    }
}

module.exports = {
    addEditOffer,
    fetchOffer
}