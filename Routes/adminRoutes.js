"use strict";

const { AdminController: Controller } = require('../Controllers');
const UniversalFunctions = require('../Utils/UniversalFunction');
const Joi = require('joi');
const Config = require('../Config');
const { config } = require('dotenv');

module.exports = [
    //Create Admin
    {
        method: "POST",
        path: '/admin/createAdmin',
        config: {
            handler: async function (request, h) {
                try {

                    return UniversalFunctions.sendSuccess(null, await Controller.createAdmin(request.payload))
                }
                catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e)
                }
            },
            description: 'Create Admin API',
            tags: ['api'],
            validate: {
                payload: Joi.object({
                    fullName: Joi.string().trim().required(),
                    email: Joi.string().lowercase().trim().required(),
                    password: Joi.string().trim().required(),
                    mobile: Joi.string().trim().required(),
                    // deviceToken: Joi.string().trim(),
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
    // Admin Login
    {
        method: "POST",
        path: "/admin/login",
        config: {
            handler: async function (request, h) {
                try {
                    return UniversalFunctions.sendSuccess(
                        null,
                        await Controller.adminLogin(request.payload)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "admin login api",
            tags: ["api", "admin"],
            validate: {
                payload: Joi.object({
                    email: Joi.string().lowercase().required(),
                    password: Joi.string().required().trim(),
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
    //Forgot Password
    {
        method: "POST",
        path: '/admin/forgot-password',
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
            description: "Forgot Password Request",
            tags: ["api", "admin"],
            validate: {
                payload: Joi.object({
                    email: Joi.string().lowercase().required(),
                })
            },
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages,
                },
            },
        },
    },
    //verify  Otp
    {
        method: "POST",
        path: "/admin/verifiy-otp",
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
            description: "Verify Otp",
            tags: ["api", "admin"],
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
            }
        }
    },
    //Change password
    {
        method: "POST",
        path: '/admin/change-password',
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
            description: "Verify Otp And Change Password",
            tags: ["api", "admin"],
            validate: {
                payload: Joi.object({
                    email: Joi.string().lowercase().required(),
                    code: Joi.string().required(),
                    password: Joi.string().required()
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
        path: "/admin/file-upload",
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
    //Create SubAdmin
    {
        method: "POST",
        path: "/admin/subadmin",
        config: {
            handler: async function (request, h) {
                let userData =
                    request.auth &&
                    request.auth.credentials &&
                    request.auth.credentials.userData
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.addEditSubAdmin(request.payload, userData)
                    )
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "admin API",
            tags: ['api'],
            auth: "AdminAuth",
            validate: {
                payload: Joi.object({
                    fullName: Joi.string().trim().required(),
                    email: Joi.string().trim().required(),
                    password: Joi.string().trim().required(),
                    mobile: Joi.string().trim().required(),
                    subadminId: Joi.string().trim()
                }),
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                "hapi-sawgger": {
                    payloadType: 'form',
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    //Get SubAdmin
    {
        method: "GET",
        path: "/admin/fetchsubadmin",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.fetchSubAdmin(request.query)
                    )
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Fetch Subadmin API",
            tags: ['api'],
            auth: "AdminAuth",
            validate: {
                query: Joi.object({
                    skip: Joi.number(),
                    page: Joi.number(),
                    limit: Joi.number()
                }),
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                "hapi-sawgger": {
                    payloadType: "form",
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    //Blocked  sub Admin stutas
    {
        method: "POST",
        path: "/admin/blockedSubAdmin/{subadminId}",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.blockSubAdminStutas(request.params)
                    )
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "blocked Subadmin stutas API",
            tags: ['api'],
            auth: "AdminAuth",
            validate: {
                params: Joi.object({
                    subadminId: Joi.string().trim().required()
                }),
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                "hapi-sawgger": {
                    payloadType: "form",
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    }
]