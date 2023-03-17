"use strict"

const Service = require("../Services").queries;
const { payload } = require("@hapi/hapi/lib/validation");
const Config = require("../Config");
const Model = require("../Models");


// //Add To Cart
// async function addToCart(payloadData, userData) {
//     try {
//         const productExit = await Service.findOne(Model.Cart,
//             {
//                 addedBy: userData._id,
//                 "products.productId": payloadData.productId,
//                 "products.variantId": payloadData.variantId,
//             })
//         if (productExit) {
//             return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.PRODUCT_ALREAY_EXIT_CART);
//         }
//         let product = {
//             productId: payloadData.productId,
//             price: payloadData.price,
//             quantity: payloadData.quantity,
//             variantId: payloadData.variantId
//         }

//         const query = { addedBy: userData._id };
//         const update = { $set: { addedBy: userData._id }, $push: { products: { $each: [product], $position: 0 } } }
//         const option = { upsert: true, new: true }

//         const cart = await Service.findAndUpdate(Model.Cart, query, update, option)
//         if (!cart)
//             return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
//         return cart
//     } catch (err) {
//         console.log(err);
//         return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
//     }
// }

//Add Edit Cart
async function addEditCart(payloadData) {
    try {
        const { userId, products } = payloadData;
        payloadData.addedBy = userId
        let cart
        if (payloadData.cartId) {
            cart = await Service.findAndUpdate(Model.Cart, { _id: payloadData.cartId }, payloadData, { new: true, lean: true })
        } else {
            const data = await Service.findOne(Model.Cart, { addedBy: userId });
            if (data) {
                cart = await Service.findAndUpdate(Model.Cart, {
                    addedBy: userId
                }, { $push: { products: products } });
            } else {
                cart = await Service.saveData(Model.Cart, payloadData, { new: true, lean: true })
                const demo = cart.products;
                console.log("cart:" + demo);
            }
        }
        if (!cart)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        return cart
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}


//Fetch Cart Aggregate
async function getCart(userData) {
    try {
        const condition = { addedBy: userData._id };
        const aggregate = [
            { $match: { ...condition } },
            {
                $unwind: { path: "$products", preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: "products",
                    let: { "productId": "$products.productId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$productId"] },
                                        // { $eq: ["isDeleted", false] }
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
                    as: "productData"
                }
            },
            {
                $unwind: { path: "$productData", preserveNullAndEmptyArrays: true }
            }
        ];
        const data = await Model.Cart.aggregate(aggregate);
        return data;
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
    }
}


//Get cart
async function cartList() {
    try {
        const data = await Model.Cart.aggregate([
            {
                $lookup: {
                    from: "products",
                    localField: "products.productId",
                    foreignField: "_id",
                    as: "product_info",
                },
            },
            {
                $unwind: "$product_info"
            },
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
            }
        ])
        return {
            cartData: data
        }

    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}


//Remove Items
async function removeItem(payloadData) {
    try {
        const { userId, productId } = payloadData;
        const data = await Service.findOne(Model.Cart, {
            addedBy: userId,
            isActive: true
        });
        if (!data)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST);
        else {
            let obj = await Service.findAndUpdate(Model.Cart, {
                addedBy: userId
            }, { $pull: { products: { productId } } })
            return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DELETED;
        }
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//Delete Cart
async function deleteCart(paramsData) {
    try {
        let data = await Service.remove(Model.Cart, { _id: paramsData.cartId })
        return {
            cartData: data
        }
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

// //delete Items
// async function deleteItem(payloadData) {
//     try {
//         const { userId, productId } = payloadData;
//         const data = await Service.findOne(Model.Cart, {
//             addedBy: userId,
//             isActive: true
//         });
//         if (!data)
//             return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST);
//         else {
//             let obj = await Service.remove(Model.Cart, {
//                 productId: productId
//             })
//             return obj
//         }
//     } catch (err) {
//         console.log(err);
//         return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
//     }
// }

module.exports = {
    // addToCart,
    addEditCart,
    getCart,
    cartList,
    deleteCart,
    // deleteItem,
    removeItem,
    // discount
}