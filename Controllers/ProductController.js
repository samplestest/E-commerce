"use strict"

const Service = require("../Services").queries;
const { query } = require("@hapi/hapi/lib/validation");
const { response } = require("@hapi/inert/lib/file");
const { default: axios } = require("axios");
const Config = require("../Config");
const Model = require("../Models");
const { getData } = require("../Services/queries");

//Add Edit Product
async function addEditProduct(payloadData) {
    try {
        const exit = await Service.findOne(Model.Product, { name: payloadData.name, _id: { $ne: payloadData.productId } })
        if (exit) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.PRODUCT_ALREAY_EXIT);
        }
        let product
        if (payloadData.productId) {
            product = await Service.findAndUpdate(Model.Product, { _id: payloadData.productId }, payloadData, { new: true, lean: true })
        } else {
            product = await Service.saveData(Model.Product, payloadData, { new: true, lean: true })
        }
        if (!product)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        return product
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//Get Product
async function productList(queryData) {
    try {
        let { active = undefined, skip = undefined, limit = undefined, search } = queryData;
        let condition = { isDeleted: false, isActive: true, isPublic: true }
        if (typeof queryData.isPublic !== "undefined") {
            condition.isPublic = queryData.isPublic
        }
        if (typeof active !== "undefined") {
            condition.isActive = active;
        }

        const aggregate = [
            { $match: { ...condition } }
        ];
        if (typeof skip !== "undefined" && typeof limit !== "undefined") {
            aggregate.push({ $skip: skip }, { $limit: limit }, { $sort: sorting });
        }

        aggregate.push(
            {
                $lookup: {
                    from: "categroys",
                    let: { "categoryId": "$categoryId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$categoryId"] },
                                        { $eq: ["$isDeleted", false] },
                                        { $eq: ["$isActive", true] },
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                name: 1
                            }
                        }
                    ],
                    as: "categoryData"
                }
            },
            {
                $unwind: { path: "$categoryData", preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: "categroys",
                    let: { "subcategoryId": "$subcategoryId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$subcategoryId"] },
                                        { $eq: ["$isDeleted", false] },
                                        { $eq: ["$isActive", true] },
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                name: 1
                            }
                        }
                    ],
                    as: "subcategoryData"
                }
            },
            {
                $unwind: { path: "$subcategoryData", preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: "categroys",
                    let: { "specificcategoryId": "$specificcategoryId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$specificcategoryId"] },
                                        { $eq: ["$isDeleted", false] },
                                        { $eq: ["$isActive", true] }
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                name: 1
                            }
                        }
                    ],
                    as: "specificcategoryData"
                }
            },
            {
                $unwind: { path: "$specificcategoryData", preserveNullAndEmptyArrays: true }
            }
        )
        const data = await Model.Product.aggregate(aggregate);
        const total = await Service.count(Model.Product, condition);
        return { productData: data.length ? data : [], total: total };
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//Status Change
async function productStatusChange(paramsData) {
    try {
        let find = await Service.findOne(Model.Product, { _id: paramsData.productId })
        let active
        if (find.isActive)
            active = false
        else
            active = true
        let data = await Service.findAndUpdate(Model.Product, { _id: paramsData.productId }, { isActive: active }, { lean: true, new: true })
        if (active)
            return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.ACTIVE;
        else
            return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.INACTIVE;
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//Delete Product
async function deleteProduct(paramsData) {
    try {
        let data = await Service.findAndUpdate(Model.Product, { _id: paramsData.productId }, { isDeleted: true })
        if (!data)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST);
        else return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DELETED
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
    }
}

//Publish Product
async function publishProduct(paramsData) {
    try {
        const publishProduct = await Service.findAndUpdate(Model.Product, { _id: paramsData.productId }, { isPublic: true }, { new: true })
        if (!publishProduct)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
        return publishProduct
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
    }
}

//reject Product
async function rejectProduct(paramsData) {
    try {
        const rejectProduct = await Service.findAndUpdate(Model.Product, { _id: paramsData.productId }, { isReject: true }, { new: true })
        if (!rejectProduct)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
        return rejectProduct
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
    }
}

//block Product
async function blockProduct(paramsData) {
    try {
        let find = await Service.findAndUpdate(Model.Product, { _id: paramsData.productId })
        if (!find)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST)
        let isBlocked
        if (find.isBlocked)
            isBlocked = false
        else
            isBlocked = true
        let data = await Service.findAndUpdate(Model.Product, { _id: paramsData.productId }, { isBlocked: isBlocked }, { lean: true, new: true })
        if (!data)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        if (isBlocked)
            return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.BLOCK;
        else
            return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.UNBLOCK;
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//API Get Product AXIOS Method
async function demoProductList(queryData) {
    try {

        let payload = { token: "2GFRJXMpuyEwafEYQ4wx5zfvitDmXYqR6tuoxgZ6RQSwABcYOeSacXmIEVrA1BXPbzgB03OylVWcy0SEX1oR", project_id: "62e0fd55cf58af8cca095e7d" }
        let res = await axios.post('https://api.project-management.surbhiinfotech.com/check-token', payload)

        let statusCode = res.status;
        if (statusCode !== 200)
            console.log("Access Denied");
        else
            console.log("status Code:" + statusCode);
        let dataPayload = { token: "2GFRJXMpuyEwafEYQ4wx5zfvitDmXYqR6tuoxgZ6RQSwABcYOeSacXmIEVrA1BXPbzgB03OylVWcy0SEX1oR", project_id: "62e0fd55cf58af8cca095e7d", url: "https://api.project-management.surbhiinfotech.com/check-token" }
        // //Use For get Method
        // let prod = await axios.get(`https://api.project-management.surbhiinfotech.com/add-request${prodPayload}`)
        let data = await axios.post('https://api.project-management.surbhiinfotech.com/add-request', dataPayload);
        let scode = data.status
        console.log("product Status: " + scode);
        if (data.status !== 200) {
            console.log("Access Denied");
        }
        else {
            let { active = undefined, skip = undefined, limit = undefined, search } = queryData;
            let condition = { isDeleted: false, isActive: true, isPublic: true }
            if (typeof queryData.isPublic !== "undefined") {
                condition.isPublic = queryData.isPublic
            }
            if (typeof active !== "undefined") {
                condition.isActive = active;
            }

            const aggregate = [
                { $match: { ...condition } }
            ];
            if (typeof skip !== "undefined" && typeof limit !== "undefined") {
                aggregate.push({ $skip: skip }, { $limit: limit }, { $sort: sorting });
            }

            aggregate.push(
                {
                    $lookup: {
                        from: "categroys",
                        let: { "categoryId": "$categoryId" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$_id", "$$categoryId"] },
                                            { $eq: ["$isDeleted", false] },
                                            { $eq: ["$isActive", true] },
                                        ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    name: 1
                                }
                            }
                        ],
                        as: "categoryData"
                    }
                },
                {
                    $unwind: { path: "$categoryData", preserveNullAndEmptyArrays: true }
                },
                {
                    $lookup: {
                        from: "categroys",
                        let: { "subcategoryId": "$subcategoryId" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$_id", "$$subcategoryId"] },
                                            { $eq: ["$isDeleted", false] },
                                            { $eq: ["$isActive", true] },
                                        ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    name: 1
                                }
                            }
                        ],
                        as: "subcategoryData"
                    }
                },
                {
                    $unwind: { path: "$subcategoryData", preserveNullAndEmptyArrays: true }
                },
                {
                    $lookup: {
                        from: "categroys",
                        let: { "specificcategoryId": "$specificcategoryId" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$_id", "$$specificcategoryId"] },
                                            { $eq: ["$isDeleted", false] },
                                            { $eq: ["$isActive", true] }
                                        ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    name: 1
                                }
                            }
                        ],
                        as: "specificcategoryData"
                    }
                },
                {
                    $unwind: { path: "$specificcategoryData", preserveNullAndEmptyArrays: true }
                }
            )
            const data = await Model.Product.aggregate(aggregate);
            const total = await Service.count(Model.Product, condition);
            console.log("TotalProduct: " + total);
            return { productData: data.length ? data : [], total: total };
        }


        // axios.get('https://api.project-management.surbhiinfotech.com/check-token')
        //     .then((response) => {
        //         console.log("Response Data:" + response)
        //     })
        //     .catch(console.log(console.error))

    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

module.exports = {
    addEditProduct,
    productList,
    // fetchProductList,
    productStatusChange,
    deleteProduct,
    publishProduct,
    rejectProduct,
    blockProduct,
    demoProductList
}