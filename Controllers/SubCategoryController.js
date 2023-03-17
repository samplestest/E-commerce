"use strict"

const Service = require("../Services").queries;
const UniversalFunctions = require("../Utils/UniversalFunction");
const Config = require("../Config");
const Model = require("../Models");

//Add Edit Sub Category
async function addEditSubCategory(payloadData) {
    try {
        let subcategory
        if (payloadData.categoryId) {
            subcategory = await Service.findAndUpdate(Model.Category, { _id: payloadData.categoryId }, payloadData, { new: true, lean: true })
        } else {
            subcategory = await Service.saveData(Model.Category, payloadData, { new: true, lean: true })
        }
        if (!subcategory)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        return subcategory
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//Remove Subcategory
async function removeSubCategory(payloadData) {
    try {
        const { categoryId, parentCategortId } = payloadData;
        const data = await Service.findOne(Model.Category, {
            _id: categoryId,
            isActive: true
        });
        if (!data)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST);
        else {
            let obj = await Service.findAndUpdate(Model.Category, {
                _id: categoryId
            }, { $pull: { parentCategortId } })
            return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DELETED;
        }
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

module.exports = {
    addEditSubCategory,
    removeSubCategory,
}