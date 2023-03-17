"use strict"

const Service = require("../Services").queries;
const { exist } = require("@hapi/joi/lib/base");
const Config = require("../Config");
const Model = require("../Models");

//Add Edit Wishlist
async function addEditWishlist(payloadData) {
    try {
        const { userId, items } = payloadData;
        payloadData.addedBy = userId
        let wish
        if (payloadData.wishlistId) {
            wish = await Service.findAndUpdate(Model.Wishlist, { _id: payloadData.wishlistId }, payloadData, { new: true, lean: true })
        } else {
            const data = await Service.findOne(Model.Wishlist, { addedBy: userId });
            if (data) {
                wish = await Service.findAndUpdate(Model.Wishlist, {
                    addedBy: userId
                }, { $push: { items: items } });
            } else {
                wish = await Service.saveData(Model.Wishlist, payloadData, { new: true, lean: true })
            }
        }
        if (!wish)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        return wish
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//Fetch WhistList
async function fetchWishList(userData) {
    try {
        return await Service.populateData(Model.Wishlist, { addedBy: userData._id }, {}, {}, [
            {
                path: "items",
                select: "name",
                model: "products"
            }
        ])
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
    }
}

//Remove wishlist
async function removeWish(payloadData) {
    try {
        const { userId, items } = payloadData;
        const data = await Service.findOne(Model.Wishlist, {
            addedBy: userId,
        });
        if (!data)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST);
        else {
            let obj = await Service.findAndUpdate(Model.Wishlist, {
                addedBy: userId
            }, { $pull: { items: items } })
            return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DELETED;
        }
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//Delete Wishlist
async function deleteWishlist(paramsData) {
    try {
        let data = await Service.remove(Model.Wishlist, { _id: paramsData.wishlistId })
        return {
            wishlistData: data
        }
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

module.exports = {
    addEditWishlist,
    fetchWishList,
    removeWish,
    deleteWishlist
}