"use strict"

const { DashboardController: Controller } = require("../Controllers");
const Config = require("../Config");
const UniversalFunctions = require("../Utils/UniversalFunction");
const Joi = require("joi");

module.exports = [
    //get Dashboard Count
    {
        method: "GET",
        path: "/admin/dashboard/count",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.fetchcount()
                    )
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Dashboard Count",
            tags: ['api'],
            auth: "AdminAuth",
            validate: {
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
    //Get total Sales
    {
        method: "GET",
        path: "/admin/dashboard/totalSales",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.fetchTotalSales(request.query)
                    )
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Fetch Total Sales",
            tags: ['api'],
            auth: "AdminAuth",
            validate: {
                query: Joi.object({
                    startDate: Joi.string(),
                    endDate: Joi.string()
                }),
                failAction: UniversalFunctions.failActionFunction
                // query: Joi.object({
                //     startDate: Joi.string().when("monthWise", { is: Joi.exist(), then: Joi.optional(), otherwise: Joi.required() }),
                //     endDate: Joi.string().when("monthWise", { is: Joi.exist(), then: Joi.optional(), otherwise: Joi.required() }),
                //     monthWish: Joi.boolean().default(false),
                //     yearWish: Joi.boolean().optional(),
                //     year: Joi.string().when("yearWish", { is: Joi.exist(), then: Joi.required(), otherwise: Joi.optional() })
                // })
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