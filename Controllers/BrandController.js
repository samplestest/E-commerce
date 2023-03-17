"use strict"

const Service = require("../Services").queries;
const UniversalFunctions = require("../Utils/UniversalFunction");
const Config = require("../Config");
const { required } = require("joi");
const Joi = require("joi");
const Model = require("../Models");

//Add Edit Brand
async function addEditBrand(payloadData, userData) {
    try {
        const exit = await Service.findOne(Model.Brand, { name: payloadData.name }, { new: true, lean: true })
        if (exit)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.BRAND_ALREADY_EXIT)
        let brand
        if (payloadData.brandId) {
            brand = await Service.findAndUpdate(Model.Brand, { _id: payloadData.brandId }, payloadData, { new: true, lean: true })
        } else {
            brand = await Service.saveData(Model.Brand, payloadData, { lean: true, new: true })
        }
        if (!brand)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        return brand
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//Fetch Brand
async function fetchBrand(queryData) {
    try {
        const { skip = 1, limit = 1, page = 1 } = queryData;
        let query = { isDeleted: false }
        let options = { sort: { createdAt: -1 } };
        if (typeof skip !== "undefined" && typeof limit !== "undefined") {
            options = { skip: ((page - 1) * limit), limit: limit * 1 };
        }

        let data = await Service.getData(Model.Brand, { query }, {}, options)
        return {
            brandData: data,
        }
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//Delete Brand By Id
async function deleteBrand(paramsData, userData) {
    try {
        const { brandId } = paramsData;
        const brand = await Service.findAndUpdate(Model.Brand, { _id: brandId }, { $set: { isDeleted: true } }, { new: true, lean: true })
        if (brand)
            return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DELETED
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST)
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
    }
}

module.exports = {
    addEditBrand,
    fetchBrand,
    deleteBrand
}