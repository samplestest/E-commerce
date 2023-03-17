"use strict"

const Service = require("../Services").queries;
const Model = require("../Models");
const Config = require("../Config");

//add Review
async function addReview(payloadData, userData) {
    try {
        let exit = await Service.findOne(Model.Review, { productId: payloadData.productId, addedBy: userData._id }, { new: true, lean: true })
        if (exit) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.REVIEW_ALREADY_EXIT)
        }
        payloadData.addedBy = userData._id;
        let review = await Service.saveData(Model.Review, payloadData);
        if (!review)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
        return review
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
    }
}


//Fetch Review 
async function fetchReview(queryData) {
    try {
        const { skip = 1, limit = 1, page = 1 } = queryData;
        let query = { isDeleted: false }

        // const CollectionOption = [
        //     {
        //         path: 'productId',
        //         select: 'name variants',
        //         model: 'products'
        //     },
        //     {
        //         path: 'addedBy',
        //         select: 'first_name ',
        //         model: 'users'
        //     }
        // ]
        let review = await Service.getData(Model.Review, { query }, {})
        return review;
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
    }
}

//Delete Review
async function deleteReview(paramsData) {
    try {
        let { reviewId } = paramsData;
        let review = await Service.findAndUpdate(Model.Review,
            { _id: reviewId },
            { $set: { isDeleted: true } });
        if (review)
            return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED
        return Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
    }
}

module.exports = {
    addReview,
    fetchReview,
    deleteReview
}