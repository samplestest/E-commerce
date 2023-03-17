"use strict"

const Service = require("../Services").queries;
const UniversalFunctions = require("../Utils/UniversalFunction");
const Config = require("../Config");
const Model = require("../Models");
const { model } = require("mongoose");

//Add Edit Category
async function addEditCategory(payloadData) {
    try {
        let category
        if (payloadData.categoryId) {
            category = await Service.findAndUpdate(Model.Category, { _id: payloadData.categoryId }, payloadData, { new: true, lean: true })
        } else {
            category = await Service.saveData(Model.Category, payloadData, { new: true, lean: true })
        }
        if (!category)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        return category
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//get Category 
async function categoryList(queryData) {
    try {
        const { page = 1, skip = 1, limit = 1 } = queryData;
        let query = { isDeleted: false }
        let options = { sort: { createdAt: -1 } };
        if (typeof skip !== "undefined" && typeof limit !== "undefined")
            options = { skip: ((page - 1) * limit), limit: limit * 1 };
        let data = await Service.getData(Model.Category, { query }, {}, options)
        let total = await Service.count(Model.Category, query)
        return {
            CategoryData: data,
            total: total
        }

    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//Status Change
async function categoryStatusChange(paramsData) {
    try {
        let find = await Service.findOne(Model.Category, { _id: paramsData.categoryId })
        let active
        if (find.isActive)
            active = false
        else
            active = true
        let data = await Service.findAndUpdate(Model.Category, { _id: paramsData.categoryId }, { isActive: active }, { lean: true, new: true })
        if (active)
            return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.ACTIVE;
        else
            return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.INACTIVE;
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//Delete Category
async function deleteCategory(paramsData) {
    try {
        let data = await Service.findAndUpdate(Model.Category, { _id: paramsData.categoryId }, { isDeleted: true });
        if (!data)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST);
        else return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DELETED;
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

module.exports = {
    addEditCategory,
    categoryList,
    categoryStatusChange,
    deleteCategory,
}