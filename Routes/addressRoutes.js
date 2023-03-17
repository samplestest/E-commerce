"use strict"

const { AddressController: Controller } = require("../Controllers");
const UniversalFunctions = require("../Utils/UniversalFunction");
const Joi = require('joi');
const Config = require('../Config');

module.exports = [
    //Add Edit Address
    {
        method: "POST",
        path: "/user/address",
        config: {
            handler: async function (request, h) {
                try {
                    // let userData =
                    //     request.auth &&
                    //     request.auth.credentials &&
                    //     request.auth.credentials.userData
                    return UniversalFunctions.sendSuccess(
                        null,
                        await Controller.addEditAddress(request.payload)
                    )
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "User Address API",
            tags: ['api', 'user'],
            validate: {
                payload: Joi.object({
                    userId: Joi.string().trim().required(),
                    city: Joi.string().trim().required(),
                    zipcode: Joi.string().trim().required(),
                    state: Joi.string().trim().required(),
                    area: Joi.string().trim().required(),
                    addressId: Joi.string().trim()
                }),
                failAction: UniversalFunctions.failActionFunction,
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    //get Address
    {
        method: "GET",
        path: "/user/addressList",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.addressList()
                    )
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Get Address List",
            tags: ['api', 'user'],
            validate: {
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

    //Delete Address
    {
        method: "DELETE",
        path: "/user/address/{addressId}",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.deleteAddress(request.params)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Delete Address",
            tags: ['api', 'user'],
            validate: {
                params: Joi.object({
                    addressId: Joi.string().required()
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
]