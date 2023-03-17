"use strict"

const Service = require("../Services").queries;
const Config = require("../Config");
const Model = require("../Models");

//Add Edit Address
async function addEditAddress(payloadData, userData) {
    try {
        const { userId, city, zipcode, state, area } = payloadData;
        payloadData.addedBy = userId
        let address
        if (payloadData.addressId) {
            address = await Service.findAndUpdate(Model.Address, { _id: payloadData.addressId }, payloadData, { new: true, lean: true })
        } else {
            address = await Service.saveData(Model.Address, payloadData, { new: true, lean: true })
        }
        if (!address)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        return address
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//Get Address
async function addressList() {
    try {
        const data = await Model.Address.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "addedBy",
                    foreignField: "_id",
                    as: "user_info",
                },
            },
            {
                $unwind: "$user_info"
            },
            {
                $project: {
                    accessToken: 0
                }
            }
        ])
        return {
            AddressData: data
        }

    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}


//Delete Address
async function deleteAddress(paramsData) {
    try {
        let data = await Service.findAndUpdate(Model.Address, { _id: paramsData.addressId }, { isDeleted: true });
        if (!data)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST);
        else return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DELETED;
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}
module.exports = {
    addEditAddress,
    addressList,
    deleteAddress
}