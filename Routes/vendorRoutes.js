"use strict"

const { VendorController: Controller } = require("../Controllers");
const UniversalFunctions = require("../Utils/UniversalFunction");
const Joi = require("joi");
const Config = require("../Config");

module.exports = [
    //Vendor Register
    {
        method: "POST",
        path: "/vendor/createVendor",
        config: {
            handler: async function (request, h) {
                try {
                    return UniversalFunctions.sendSuccess(
                        null,
                        await Controller.vendorRegister(request.payload)
                    )
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e)
                }
            },
            description: "vendor Register API",
            tags: ['api'],
            validate: {
                payload: Joi.object({
                    fullName: Joi.string().trim().required(),
                    email: Joi.string().trim().required(),
                    password: Joi.string().trim().required(),
                    mobile: Joi.string().trim().required(),
                    gender: Joi.string().trim().required(),
                    gstNo: Joi.string().trim().required(),
                    idProof: Joi.object({
                        adharCardFront: Joi.string().required()
                    }),
                    pickupAddress: Joi.object({
                        pincode: Joi.string().required(),
                        address: Joi.string().required(),
                        location: Joi.string().required(),
                        city: Joi.string().required(),
                        state: Joi.string().required()
                    }),
                    bankDetails: Joi.object({
                        bankName: Joi.string().required(),
                        accountNo: Joi.string().required(),
                        isfc: Joi.string().required(),
                        accountHolderName: Joi.string().required()
                    })
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
    //vendor Login
    {
        method: "POST",
        path: "/vendor/login",
        config: {
            handler: async function (request, h) {
                try {
                    return UniversalFunctions.sendSuccess(
                        null,
                        await Controller.vendorLogin(request.payload)
                    )
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Vendor Login",
            tags: ['api', 'vendor'],
            validate: {
                payload: Joi.object({
                    email: Joi.string().trim().required(),
                    password: Joi.string().trim().required()
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
    //forgot Password
    {
        method: "POST",
        path: "/vendor/forgot-password",
        config: {
            handler: async function (request, h) {
                try {
                    return UniversalFunctions.sendSuccess(
                        null,
                        await Controller.forgotPassword(request.payload)
                    )
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Forgot Password Requset",
            tags: ['api'],
            validate: {
                payload: Joi.object({
                    email: Joi.string().lowercase().required(),
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
    //verify  Otp
    {
        method: "POST",
        path: "/vendor/verifiy-otp",
        config: {
            handler: async function (request, h) {
                try {
                    return UniversalFunctions.sendSuccess(
                        null,
                        await Controller.verifyOTP(request.payload)
                    )
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Verify Otp",
            tags: ['api'],
            validate: {
                payload: Joi.object({
                    email: Joi.string().lowercase().required(),
                    code: Joi.string().required()
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
    //Change Password
    {
        method: "POST",
        path: '/vendor/change-password',
        config: {
            handler: async function (request, h) {
                try {
                    let userData =
                        request.auth &&
                        request.auth.credentials &&
                        request.auth.credentials.userData
                    return UniversalFunctions.sendSuccess(
                        null,
                        await Controller.changePassword(request.payload, userData)
                    )
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Verify Otp And Change Password",
            tags: ['api'],
            validate: {
                payload: Joi.object({
                    email: Joi.string().required(),
                    code: Joi.string().required(),
                    password: Joi.string().required()
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
    //Fetch Vendor
    {
        method: "GET",
        path: "/vendor/fetchvendor",
        config: {
            handler: async function (request, h) {
                try {
                    let userData =
                        request.auth &&
                        request.auth.credentials &&
                        request.auth.credentials.userData
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.fetchVendor(request.query)
                    )
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e)
                }
            },
            description: "Fetch Vendor List",
            tags: ['api'],
            auth: "AdminAuth",
            validate: {
                query: Joi.object({
                    skip: Joi.number(),
                    limit: Joi.number(),
                    page: Joi.number(),
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
    //Vendor change Status
    {
        method: "POST",
        path: "/vendor/change-status/{vendorId}",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.changeStatus(request.params)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Change Vendor status",
            auth: "AdminAuth",
            tags: ['api'],
            validate: {
                params: Joi.object({
                    vendorId: Joi.string().required(),
                }),
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
    //Vendor Change Status Block
    {
        method: "POST",
        path: "/vendor/blockChangeStatus/{vendorId}",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.blockchangeStatus(request.params)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Change Block Status",
            auth: "AdminAuth",
            tags: ['api'],
            validate: {
                params: Joi.object({
                    vendorId: Joi.string().required()
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
    //Vendor Reject
    {
        method: "POST",
        path: "/vendor/reject",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.rejectVendor(request.payload)
                    )
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Vendor Reject",
            auth: "AdminAuth",
            tags: ['api'],
            validate: {
                payload: Joi.object({
                    vendorId: Joi.string().required(),
                    reason: Joi.string().required()
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
    }
]