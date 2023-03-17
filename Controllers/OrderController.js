"use strict"

const Service = require("../Services").queries;
const Config = require("../Config");
const Model = require("../Models");
const CodeGenerator = require("../Lib/CodeGenerator");
const UniversalFunctions = require("../Utils/UniversalFunction");
const orderid = require('order-id')('key');



//Add  Order Demo
async function addEditOrder(payloadData, userData) {
    try {
        const cart = await Service.findOne(Model.Cart, { addedBy: userData._id, _id: payloadData.cartId, isActive: true })
        if (!cart) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.CART_NOT_EXIT);
        }
        const cartId = await Service.findOne(Model.Order, { addedBy: userData._id, cartId: payloadData.cartId })
        if (cartId) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.CART_ALREAY_EXIT);
        }
        let arr = [];
        for (let index = 0; index < cart.products.length; index++) {
            const element = cart.products[index];

            let obj = {
                productId: element.productId,
                price: element.price,
                quantity: element.quantity,
                totalPrice: (element.price * element.quantity),
                variantId: element.variantId
            }
            arr.push(obj);

            //check variant and minus variants quantity
            let data = await Service.findAndUpdate(Model.Product, {
                _id: element.productId,
                productAvailable: "STOCK",
                variants: {
                    $elemMatch:
                    {
                        _id: element.variantId,
                        variantAvailable: "STOCK",
                        qty: { $gte: 0 }
                    }
                }
            }, { $inc: { "variants.$.qty": -element.quantity } }
            )
            //update variants stock available or not
            console.log("Data:" + data);
            await Service.findAndUpdate(Model.Product, {
                _id: obj.productId,
                productAvailable: "STOCK",
                variants: {
                    $elemMatch:
                    {
                        _id: element.variantId,
                        variantAvailable: "STOCK",
                        qty: { $eq: 0 }
                    }
                }
            }, { "variants.$.variantAvailable": "OUTOFSTOCK" }
            )
            //update product available or not
            await Service.findAndUpdate(Model.Product, {
                _id: obj.productId,
                variants: { $not: { $elemMatch: { qty: { $nin: [0] } } } }
            }, { productAvailable: "OUTOFSTOCK" }
            )

        }
        payloadData.orderNumber = orderid.generate();
        payloadData.addedBy = userData._id;
        payloadData.order = arr;
        const order = await Service.saveData(Model.Order, payloadData)
        if (!order) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        }
        await Service.findAndUpdate(Model.Cart, { _id: payloadData.cartId }, { isActive: false })
        return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.ORDERS
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//Add  Order
// async function addEditOrder(payloadData, userData) {
//     try {
//         const cart = await Service.findOne(Model.Cart, { addedBy: userData._id, _id: payloadData.cartId, isActive: true })
//         if (!cart) {
//             return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.CART_NOT_EXIT);
//         }
//         const cartId = await Service.findOne(Model.Order, { addedBy: userData._id, cartId: payloadData.cartId })
//         if (cartId) {
//             return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.CART_ALREAY_EXIT);
//         }
//         for (let index = 0; index < cart.products.length; index++) {
//             const element = cart.products[index];
//             let obj = {
//                 addedBy: userData._id,
//                 // orderNumber: CodeGenerator.generateCode(),
//                 paymentMode: payloadData.paymentMode,
//                 cartId: payloadData.cartId,
//                 addressId: payloadData.addressId,
//                 productId: element.productId,
//                 price: element.price,
//                 quantity: element.quantity,
//                 variantId: element.variantId

//             }
//             const order = await Service.saveData(Model.Order, obj)
//             if (!order) {
//                 return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
//             }
//             //check variant and minus variants quantity
//             let data = await Service.findAndUpdate(Model.Product, {
//                 _id: element.productId,
//                 productAvailable: "STOCK",
//                 variants: {
//                     $elemMatch:
//                     {
//                         _id: element.variantId,
//                         variantAvailable: "STOCK",
//                         qty: { $gte: 0 }
//                     }
//                 }
//             }, { $inc: { "variants.$.qty": -element.quantity } }
//             )
//             //update variants stock available or not
//             console.log("Data:" + data);
//             await Service.findAndUpdate(Model.Product, {
//                 _id: obj.productId,
//                 productAvailable: "STOCK",
//                 variants: {
//                     $elemMatch:
//                     {
//                         _id: element.variantId,
//                         variantAvailable: "STOCK",
//                         qty: { $eq: 0 }
//                     }
//                 }
//             }, { "variants.$.variantAvailable": "OUTOFSTOCK" }
//             )
//             //update product available or not
//             await Service.findAndUpdate(Model.Product, {
//                 _id: obj.productId,
//                 variants: { $not: { $elemMatch: { qty: { $nin: [0] } } } }
//             }, { productAvailable: "OUTOFSTOCK" }
//             )

//         }
//         await Service.findAndUpdate(Model.Cart, { _id: payloadData.cartId }, { isActive: false })
//         return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.ORDERS
//     } catch (err) {
//         console.log(err);
//         return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
//     }
// }

//get Order
async function orderList(queryData, userData) {
    try {

        let { skip = undefined, limit = undefined, search } = queryData;
        let condition = { addedBy: userData._id }
        let sorting = { _id: -1 }
        //search
        const aggregate = [
            { $match: { ...condition } },
            { $sort: sorting }
        ];
        if (typeof skip !== "undefined" && typeof limit !== "undefined") {
            aggregate.push({ $skip: skip }, { $limit: limit }, { $sort: sorting });
        }
        aggregate.push(
            {
                $lookup: {
                    from: "products",
                    let: { "productId": "$productId", "variantId": "$variantId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$productId"] },
                                        { $eq: ["$isDeleted", false] },
                                        { $eq: ["$isActive", true] },
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                name: 1,
                                variant: {
                                    $arrayElemAt: [{
                                        $filter: {
                                            input: '$variants',
                                            as: 'variant',
                                            cond: { $eq: ['$$variant._id', '$$variantId'] }
                                        }
                                    }, 0]
                                }
                            }
                        }
                    ],
                    as: "productData"
                }
            },
            {
                $unwind: { path: "$productData", preserveNullAndEmptyArrays: true },
            },
            {
                $lookup: {
                    from: "addresses",
                    let: { "userId": "$addedBy", "addressId": "$addressId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$addressId"] },
                                        { $eq: ["$addedBy", "$$userId"] },
                                        { $eq: ["$isDeleted", false] }
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                city: 1,
                                zipcode: 1,
                                state: 1,
                                area: 1
                            }
                        }
                    ],
                    as: "addressData"
                }
            },
            {
                $unwind: { path: "$addressData", preserveNullAndEmptyArrays: true },
            },
            {
                $project: {
                    orderStatus: 1,
                    paymentMode: 1,
                    quantity: 1,
                    price: 1,
                    productData: 1,
                    addressData: 1,
                    createdAt: 1
                }
            }

        )
        const data = await Model.Order.aggregate(aggregate);
        const total = await Service.count(Model.Order, condition);
        return { orderData: data.length ? data[0] : [], total: total };
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}


//Delete Order
async function deleteOrder(paramsData) {
    try {
        let data = await Service.findAndUpdate(Model.Order, { _id: paramsData.orderId }, { isDeleted: true })
        if (!data)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST);
        else return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DELETED
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
    }
}

//Discount 
async function discount(payloadData) {
    try {
        const { userId, discountCode } = payloadData;
        let exit = await Service.findOne(Model.Coupon, { discountCode: discountCode })
        if (exit) {
            const userid = await Service.findOne(Model.Coupon, { userList: userId })
            if (!userid) {
                const cart = await Service.findAndUpdate(Model.Order,
                    { addedBy: userId },
                    {
                        $set: {
                            discount: exit.discountValue
                        }
                    },
                    { new: true, lean: true }
                );

                if (cart) {
                    //Add UserList 
                    const user = await Service.findAndUpdate(Model.Coupon,
                        { discountCode: discountCode },
                        {
                            $push: { userList: userId }
                        }
                    );

                    //update limitofUser 
                    let data = await Service.findAndUpdate(Model.Coupon, {
                        discountCode: discountCode,
                        couponAvalible: "AVALIBLE",
                        limitofPurchaseUser: { $gte: 0 }
                    }, { $inc: { "limitofPurchaseUser": -1 } }
                    )

                    //update CouponAvalible
                    Service.findAndUpdate(Model.Coupon, {
                        discountCode: discountCode,
                        couponAvalible: "AVALIBLE",
                        limitofPurchaseUser: { $eq: 0 }
                    }, { "couponAvalible": "NOTAVALIBLE" }
                    )
                }


                return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DISCOUNT
            } else {
                return Config.APP_CONSTANTS.STATUS_MSG.ERROR.ALREADY_DISCOUNTED
            }
        }
        else {
            return Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_DISCOUNT
        }
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}


module.exports = {
    addEditOrder,
    orderList,
    deleteOrder,
    discount
}
