"use strict"

const { CartController: Controller } = require("../Controllers");
const UniversalFunctions = require("../Utils/UniversalFunction");
const Config = require("../Config");
const Joi = require('joi');

module.exports = [
    //Add Edit Cart
    {
        method: "POST",
        path: "/user/cart",
        config: {
            handler: async function (request, h) {
                try {
                    let userData =
                        request.auth &&
                        request.auth.credentials &&
                        request.auth.credentials.userData
                    return UniversalFunctions.sendSuccess(
                        null,
                        await Controller.addEditCart(request.payload, userData)
                    );
                } catch (e) {
                    console.log(e);
                    return UniversalFunctions.sendError(e);
                }
            },
            description: "Cart API",
            auth: "UserAuth",
            tags: ['api', 'user'],
            validate: {
                payload: Joi.object({
                    userId: Joi.string().trim().required(),
                    productId: Joi.string().trim().required(),
                    price: Joi.string().trim().required(),
                    quantity: Joi.string().trim().required(),
                    variantId: Joi.string().trim().required()
                    // products: Joi.array(),
                    // cartId: Joi.string().trim(),
                }),
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    //get Cart
    {
        method: "GET",
        path: "/user/cartList",
        config: {
            handler: async function (request, h) {
                try {
                    const userData =
                        request.auth &&
                        request.auth.credentials &&
                        request.auth.credentials.userData;
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.cartList(request.query, userData)
                    )
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Get Cart List",
            auth: "UserAuth",
            tags: ['api', 'user'],
            validate: {
                query: Joi.object({
                    skip: Joi.number(),
                    limit: Joi.number(),
                    search: Joi.string()
                }),
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages,
                }
            }
        }
    },

    // Remove Items
    {
        method: "POST",
        path: "/user/cartItem",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.removeItem(request.payload)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "delete Item",
            auth: "UserAuth",
            tags: ['api', 'user'],
            validate: {
                payload: Joi.object({
                    userId: Joi.string().trim().required(),
                    productId: Joi.string().trim().required()
                }),
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages,
                },
            },
        }
    },
    //Delete Cart
    {
        method: "DELETE",
        path: "/user/cartItem/{cartId}",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.deleteCart(request.params)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Delete Cart",
            auth: "UserAuth",
            tags: ['api', 'user'],
            validate: {
                params: Joi.object({
                    cartId: Joi.string().required()
                }),
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages,
                },
            },
        }
    },
    // //Discount coupon
    // {
    //     method: "POST",
    //     path: "/user/discount",
    //     config: {
    //         handler: async function (request, h) {
    //             try {
    //                 return await UniversalFunctions.sendSuccess(
    //                     null,
    //                     await Controller.discount(request.payload)
    //                 );
    //             } catch (e) {
    //                 console.log(e);
    //                 return await UniversalFunctions.sendError(e);
    //             }
    //         },
    //         description: "Discount API",
    //         auth: "UserAuth",
    //         tags: ['api'],
    //         validate: {
    //             payload: Joi.object({
    //                 userId: Joi.string().trim().required(),
    //                 discountCode: Joi.string().trim().required()
    //             }),
    //             failAction: UniversalFunctions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-sawgger': {
    //                 payloadType: 'form',
    //                 responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages
    //             }
    //         }
    //     }
    // }
]