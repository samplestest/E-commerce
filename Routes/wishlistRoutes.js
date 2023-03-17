"use strict"

const { WishlistController: Controller } = require("../Controllers");
const UniversalFunctions = require("../Utils/UniversalFunction");
const Joi = require('joi');
const Config = require("../Config");
const { config } = require("dotenv");

module.exports = [
    //Add Edit Wishlist 
    {
        method: "POST",
        path: "/user/wishlist",
        config: {
            handler: async function (request, h) {
                try {
                    return UniversalFunctions.sendSuccess(
                        null,
                        await Controller.addEditWishlist(request.payload)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e)
                }
            },
            description: "Wishlist API",
            auth: "UserAuth",
            tags: ['api', 'user'],
            validate: {
                payload: Joi.object({
                    userId: Joi.string().trim().required(),
                    items: Joi.array(),
                    wishlistId: Joi.string().trim(),
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
    //Fetch Wishlist
    {
        method: "GET",
        path: "/user/wishlist",
        config: {
            handler: async function (request, h) {
                try {
                    const userData =
                        request.auth &&
                        request.auth.credentials &&
                        request.auth.credentials.userData
                    return UniversalFunctions.sendSuccess(
                        null,
                        await Controller.fetchWishList(userData)
                    );
                } catch (e) {
                    console.log(e);
                    return UniversalFunctions.sendError(e);
                }
            },
            description: "Fetch User Wishlist ",
            auth: "UserAuth",
            tags: ['api'],
            validate: {
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

    //Remove Wishlist
    {
        method: "POST",
        path: "/user/removewish",
        config: {
            handler: async function (request, h) {
                try {
                    return UniversalFunctions.sendSuccess(
                        null,
                        await Controller.removeWish(request.payload)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e)
                }
            },
            description: "Wishlist Remove API",
            auth: "UserAuth",
            tags: ['api', 'user'],
            validate: {
                payload: Joi.object({
                    userId: Joi.string().trim().required(),
                    items: Joi.string().trim().required()
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
    //Delete Wishlist
    {
        method: "DELETE",
        path: "/user/wishlist/{wishlistId}",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.deleteWishlist(request.params)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Delete Wishlist",
            auth: "UserAuth",
            tags: ['api', 'user'],
            validate: {
                params: Joi.object({
                    wishlistId: Joi.string().required()
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
    }
]