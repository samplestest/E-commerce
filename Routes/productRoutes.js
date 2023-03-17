"use strict"

const { ProductController: Controller } = require("../Controllers");
const UniversalFunctions = require("../Utils/UniversalFunction");
const Config = require("../Config");
const Joi = require('joi');
const axios = require('axios');

module.exports = [
    //Add Edit Product
    {
        method: "POST",
        path: "/user/product",
        config: {
            handler: async function (request, h) {
                try {
                    const userData =
                        request.auth &&
                        request.auth.credentials &&
                        request.auth.credentials.userData;
                    return UniversalFunctions.sendSuccess(
                        null,
                        await Controller.addEditProduct(request.payload, userData)
                    );
                } catch (e) {
                    console.log(e);
                    return UniversalFunctions.sendError(e);
                }
            },
            description: "Add Edit Product API",
            auth: "UserAuth",
            tags: ['api', 'user'],
            validate: {
                payload: Joi.object({
                    productId: Joi.string().trim(),
                    name: Joi.string().trim().required(),
                    images: Joi.string().trim().required(),
                    description: Joi.string().trim().required(),
                    price: Joi.number().required(),
                    quantity: Joi.number().required(),
                    categoryId: Joi.string().trim().required(),
                    subcategoryId: Joi.string().trim().required(),
                    specificcategoryId: Joi.string().trim().required(),
                    discount: Joi.number().required(),
                    variants: Joi.array().items(
                        Joi.object({
                            sku: Joi.string(),
                            title: Joi.string(),
                            qty: Joi.number(),
                            price: Joi.number(),
                            variantImage: Joi.string()
                        })
                    )
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
    //get Product
    {
        method: "GET",
        path: "/user/productList",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.productList(request.query)
                    )
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Get Product List",
            // auth: "AdminAuth",
            tags: ['api', 'user'],
            validate: {
                query: Joi.object({
                    skip: Joi.number(),
                    limit: Joi.number(),
                    search: Joi.string(),
                    active: Joi.boolean(),
                    // discounts: Joi.any(),
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

    //Status Change
    {
        method: "POST",
        path: "/user/product_status_change/{productId}",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.productStatusChange(request.params)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Product Status Change",
            auth: "AdminAuth",
            tags: ['api', 'user'],
            validate: {
                params: Joi.object({
                    productId: Joi.string().required(),
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

    //Delete Product
    {
        method: "DELETE",
        path: "/user/product/{productId}",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.deleteProduct(request.params)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Delete Product",
            auth: "AdminAuth",
            tags: ['api', 'user'],
            validate: {
                params: Joi.object({
                    productId: Joi.string().required(),
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
    //Publish Product
    {
        method: "POST",
        path: "/user/publishproduct/{productId}",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.publishProduct(request.params)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Publish Product API",
            auth: "AdminAuth",
            tags: ['api', 'user'],
            validate: {
                params: Joi.object({
                    productId: Joi.string().required(),
                }),
                headers: UniversalFunctions.authorizationHeaderObj,
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
    //Reject Product
    {
        method: "POST",
        path: "/user/rejectproduct/{productId}",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.rejectProduct(request.params)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e)
                }
            },
            description: "Reject Product API",
            auth: "AdminAuth",
            tags: ['api', 'user'],
            validate: {
                params: Joi.object({
                    productId: Joi.string().required()
                }),
                headers: UniversalFunctions.authorizationHeaderObj,
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
    //Block Product
    {
        method: "POST",
        path: "/user/blockproduct/{productId}",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.blockProduct(request.params)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e)
                }
            },
            description: "Block Product API",
            auth: "AdminAuth",
            tags: ['api', 'user'],
            validate: {
                params: Joi.object({
                    productId: Joi.string().required()
                }),
                headers: UniversalFunctions.authorizationHeaderObj,
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
    //get Product AXIOS Method
    {
        method: "GET",
        path: "/product",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.demoProductList(request.query)
                    )
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Get Product List",
            // auth: "AdminAuth",
            tags: ['api', 'user'],
            validate: {
                query: Joi.object({
                    skip: Joi.number(),
                    limit: Joi.number(),
                    search: Joi.string(),
                    active: Joi.boolean(),
                    // discounts: Joi.any(),
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
]

