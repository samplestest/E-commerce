"use strict"

const { UserController: Controller } = require('../Controllers');
const UniversalFunctions = require('../Utils/UniversalFunction');
const Joi = require('joi');
const Config = require('../Config');

module.exports = [
    //User Register
    {
        method: "POST",
        path: "/user/craeteUser",
        config: {
            handler: async function (request, h) {
                try {
                    return UniversalFunctions.sendSuccess(
                        null,
                        await Controller.craeteUser(request.payload)
                    )
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e)
                }
            },
            description: "User Create API",
            tags: ['api', 'user'],
            validate: {
                payload: Joi.object({
                    first_name: Joi.string().trim().required(),
                    last_name: Joi.string().trim().required(),
                    email: Joi.string().lowercase().trim().required(),
                    password: Joi.string().trim().required(),
                    image: Joi.string().trim().required()
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
    //User Login
    {
        method: "POST",
        path: "/user/login",
        config: {
            handler: async function (request, h) {
                try {
                    return UniversalFunctions.sendSuccess(
                        null,
                        await Controller.userLogin(request.payload)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "User Login API",
            tags: ["api", "user"],
            validate: {
                payload: Joi.object({
                    email: Joi.string().lowercase().trim().required(),
                    password: Joi.string().trim().required()
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
    //forgot Password
    {
        method: "POST",
        path: "/user/forgot-password",
        config: {
            handler: async function (request, h) {
                try {
                    let userData =
                        request.auth &&
                        request.auth.credentials &&
                        request.auth.credentials.userData;
                    return UniversalFunctions.sendSuccess(
                        null,
                        await Controller.forgotPassword(request.payload, userData)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e)
                }
            },
            description: "Forgot Password Request",
            tags: ["api", "user"],
            validate: {
                payload: Joi.object({
                    email: Joi.string().lowercase().required()
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
    //verify otp
    {
        method: "POST",
        path: "/user/verify-otp",
        config: {
            handler: async function (request, h) {
                try {
                    return UniversalFunctions.sendSuccess(
                        null,
                        await Controller.verifyOTP(request.payload)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "verify otp",
            tags: ["api", "User"],
            validate: {
                payload: Joi.object({
                    email: Joi.string().lowercase().required(),
                    code: Joi.string().required(),
                }),
                failAction: UniversalFunctions.failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages,
                },
            },
        },
    },
    //Change Pasword
    {
        method: "POST",
        path: "/user/change-password",
        config: {
            handler: async function (request, h) {
                try {
                    let userData =
                        request.auth &&
                        request.auth.credentials &&
                        request.auth.credentials.userData;
                    return UniversalFunctions.sendSuccess(
                        null,
                        await Controller.changePassword(request.payload, userData)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Verify Otp And Change Pasword",
            tags: ["api", "User"],
            validate: {
                payload: Joi.object({
                    email: Joi.string().lowercase().trim().required(),
                    password: Joi.string().trim().required(),
                    code: Joi.string().trim().required()
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
        },
    },
    //file upload
    {
        method: "POST",
        path: "/file-upload",
        config: {
            handler: async function (request, h) {
                try {
                    return UniversalFunctions.sendSuccess(
                        null,
                        await Controller.fileUpload(request.payload)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "file upload api",
            tags: ["api", "admin"],
            payload: {
                maxBytes: 100000000,
                parse: true,
                multipart: {
                    output: "file"
                },
            },
            validate: {
                payload: Joi.object({
                    file: Joi.any()
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
        },
    },
    //fetch User
    {
        method: "GET",
        path: "/admin/user",
        config: {
            handler: async function (request, h) {
                try {
                    const userData =
                        request.auth &&
                        request.auth.credentials &&
                        request.auth.credentials.userData
                    return UniversalFunctions.sendSuccess(
                        null,
                        await Controller.fetchUser(request.query, userData)
                    )
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Fetch User List",
            auth: "AdminAuth",
            tags: ['api'],
            validate: {
                query: Joi.object({
                    skip: Joi.number(),
                    limit: Joi.number(),
                    page: Joi.number()
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
    //Import Xlxl
    {
        method: "POST",
        path: "/admin/import/xlsx",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.importXlxl(request.payload)
                    )
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Xlxl Import API",
            auth: "AdminAuth",
            tags: ['api'],
            payload: {
                maxBytes: 100000000,
                parse: true,
                multipart: {
                    output: "file"
                },
            },
            validate: {
                payload: Joi.object({
                    file: Joi.any()
                }),
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                "hapi-sawgger": {
                    payloadType: "from",
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    //Export X1xl
    {
        method: "GET",
        path: "/admin/export/x1xl",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.getX1xlExport()
                    )
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Export API",
            tags: ['api'],
            auth: "AdminAuth",
            validate: {
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                "hapi-sawgger": {
                    payload: "from",
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    }
]