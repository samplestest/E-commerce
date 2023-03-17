"use strict"

const { SubAdminController: Controller } = require("../Controllers");
const Config = require("../Config");
const Joi = require("joi");
const UniversalFunctions = require("../Utils/UniversalFunction");

module.exports = [
    //subAdmin add
    {
        method: "POST",
        path: "/admin/addsubadmin",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.subadmin()
                    )
                } catch (e) {
                    console.log(e);
                    return UniversalFunctions.sendError(e);
                }
            },
            description: "Sub admin",
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
                    payloadType: "form",
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    }
]