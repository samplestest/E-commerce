"use strict"

const Service = require("../Services").queries;
const UniversalFunctions = require("../Utils/UniversalFunction");
const Config = require("../Config");
const Model = require("../Models");

//Add Edit Specific Category
async function addEditSpecificCategory(payloadData) {
    try {
        let specificcategory
        if (payloadData.categoryId) {
            specificcategory = await Service.findAndUpdate(Model.Category, { _id: payloadData.categoryId }, payloadData, { new: true, lean: true })
        } else {
            specificcategory = await Service.saveData(Model.Category, payloadData, { new: true, lean: true })
        }
        if (!specificcategory)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        return specificcategory
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

module.exports = {
    addEditSpecificCategory,
}