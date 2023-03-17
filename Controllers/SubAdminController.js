"use strict"

const Service = require("../Services").queries;
const Config = require("../Config");
const Model = require("../Models");
const UniversalFunctions = require("../Utils/UniversalFunction");

//add subadmin
async function subadmin(payloadData) {
    try {
        if (payloadData.subadminId) {
            let find = await Service.findOne(Model.Admin, { _id: paylo })
        }
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
    }
}

module.exports = {
    subadmin
}